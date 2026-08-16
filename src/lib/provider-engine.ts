import { connectDB } from "./db"
import { Provider, ProviderService, Order, SystemLog } from "./models"
import { decrypt } from "./crypto"
import { SMMPanel } from "./smm-panel"
import { Types } from "mongoose"

export interface ProviderDispatchResult {
  success: boolean
  providerId: string
  externalOrderId?: string
  rawResponse?: Record<string, unknown>
  error?: string
  latencyMs: number
}

/**
 * Dispatch an order to the best available provider.
 * Uses the SMMPanel class for proper API format (URL-encoded form data).
 * Updates the order record with provider details and status.
 */
export async function dispatchOrder(
  orderId: Types.ObjectId | string,
  serviceId: Types.ObjectId | string,
  quantity: number,
  targetUrl: string
): Promise<ProviderDispatchResult> {
  await connectDB()

  // Get active provider services for this service, sorted by priority
  const providerServices = await ProviderService.find({
    serviceId,
    isActive: true,
    minQuantity: { $lte: quantity },
    maxQuantity: { $gte: quantity },
  })
    .populate("providerId")
    .sort({ priority: -1 })

  if (providerServices.length === 0) {
    const reason = "No active provider services found for this service"
    await Order.findByIdAndUpdate(orderId, {
      status: "FAILED",
      failureReason: reason,
      failedAt: new Date(),
    })
    await logEvent("error", "provider-engine", reason, { serviceId, quantity })
    return { success: false, providerId: "", error: reason, latencyMs: 0 }
  }

  let lastError = ""
  let totalLatency = 0

  // Try each provider in priority order
  for (const ps of providerServices) {
    const provider = ps.providerId as unknown as {
      _id: Types.ObjectId
      name: string
      apiUrl: string
      apiKey: string
      isActive: boolean
      timeoutMs: number
      maxRetries: number
    }

    if (!provider || !provider.isActive) continue

    // Decrypt API key
    let apiKey: string
    try {
      apiKey = decrypt(provider.apiKey)
    } catch {
      // Try using the key as-is if decryption fails (might be stored unencrypted)
      apiKey = provider.apiKey
    }

    const panel = new SMMPanel({
      apiUrl: provider.apiUrl,
      apiKey,
    })

    // Retry logic
    const maxRetries = provider.maxRetries || 2
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const attemptStart = Date.now()

      try {
        const result = await panel.addOrder(
          parseInt(ps.externalServiceId),
          targetUrl,
          quantity
        )

        const attemptLatency = Date.now() - attemptStart
        totalLatency += attemptLatency

        if (result.order) {
          // Success — update order with provider details
          await Order.findByIdAndUpdate(orderId, {
            providerId: provider._id,
            providerServiceId: ps._id,
            providerOrderId: result.order.toString(),
            providerResponse: result as unknown as Record<string, unknown>,
            status: "PROVIDER_DISPATCHED",
            latencyMs: totalLatency,
          })

          await logEvent("info", "provider-engine", "Order dispatched successfully", {
            orderId,
            providerId: provider._id,
            providerName: provider.name,
            providerServiceId: ps._id,
            externalServiceId: ps.externalServiceId,
            providerOrderId: result.order.toString(),
            attempt: attempt + 1,
            latencyMs: attemptLatency,
          })

          return {
            success: true,
            providerId: provider._id.toString(),
            externalOrderId: result.order.toString(),
            rawResponse: result as unknown as Record<string, unknown>,
            latencyMs: totalLatency,
          }
        }

        // Provider returned no order ID — treat as failure
        lastError = result.error || "Provider returned no order ID"

        await logEvent("warn", "provider-engine", `Provider attempt ${attempt + 1} failed`, {
          orderId,
          providerId: provider._id,
          providerName: provider.name,
          attempt: attempt + 1,
          error: lastError,
          response: result as unknown as Record<string, unknown>,
          latencyMs: attemptLatency,
        })
      } catch (error) {
        const attemptLatency = Date.now() - attemptStart
        totalLatency += attemptLatency
        lastError = error instanceof Error ? error.message : "Unknown error"

        await logEvent("warn", "provider-engine", `Provider attempt ${attempt + 1} error`, {
          orderId,
          providerId: provider._id,
          providerName: provider.name,
          attempt: attempt + 1,
          error: lastError,
          latencyMs: attemptLatency,
        })
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    // This provider failed all attempts, try next
    lastError = `Provider ${provider.name} failed after ${maxRetries + 1} attempts: ${lastError}`
  }

  // All providers failed
  await Order.findByIdAndUpdate(orderId, {
    status: "FAILED",
    failureReason: lastError,
    failedAt: new Date(),
    latencyMs: totalLatency,
  })

  await logEvent("error", "provider-engine", "All providers failed for order", {
    orderId,
    serviceId,
    error: lastError,
    totalLatency,
  })

  return { success: false, providerId: "", error: lastError, latencyMs: totalLatency }
}

async function logEvent(
  level: "info" | "warn" | "error" | "debug",
  category: string,
  message: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    await SystemLog.create({ level, category, message, metadata })
  } catch (error) {
    console.error("Failed to log event:", error)
  }
}
