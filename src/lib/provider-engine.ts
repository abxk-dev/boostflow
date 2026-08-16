import { connectDB } from "./db"
import { Provider, ProviderService, Order, SystemLog } from "./models"
import { decrypt } from "./crypto"
import { ProviderDispatchResult } from "@/types"
import { Types } from "mongoose"

interface ProviderOrderPayload {
  service: string
  quantity: number
  url: string
}

async function callProviderApi(
  apiUrl: string,
  apiKey: string,
  payload: ProviderOrderPayload,
  timeoutMs: number
): Promise<{ success: boolean; orderId?: string; response: Record<string, unknown>; error?: string }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        service: payload.service,
        quantity: payload.quantity,
        url: payload.url,
      }),
      signal: controller.signal,
    })

    const data = (await response.json()) as Record<string, unknown>

    if (!response.ok) {
      return {
        success: false,
        response: data,
        error: (data.message as string) || `HTTP ${response.status}`,
      }
    }

    // Common provider response formats
    const orderId = (data.order_id || data.order || data.id || data.orderId) as string | undefined

    return {
      success: true,
      orderId: orderId?.toString(),
      response: data,
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        response: {},
        error: "Request timeout",
      }
    }
    return {
      success: false,
      response: {},
      error: error instanceof Error ? error.message : "Unknown error",
    }
  } finally {
    clearTimeout(timeout)
  }
}

export async function dispatchOrder(
  orderId: Types.ObjectId,
  serviceId: Types.ObjectId,
  quantity: number,
  targetUrl: string
): Promise<ProviderDispatchResult> {
  await connectDB()

  // Get active provider services sorted by priority
  const providerServices = await ProviderService.find({
    serviceId,
    isActive: true,
    minQuantity: { $lte: quantity },
    maxQuantity: { $gte: quantity },
  })
    .populate("providerId")
    .sort({ priority: -1 })

  if (providerServices.length === 0) {
    await logEvent("error", "provider-engine", "No active providers found for service", {
      serviceId,
      quantity,
    })
    return {
      success: false,
      providerId: "",
      error: "No providers available",
      latencyMs: 0,
    }
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
      timeoutMs: number
      maxRetries: number
    }

    if (!provider) continue

    const startTime = Date.now()

    // Decrypt API key
    let apiKey: string
    try {
      apiKey = decrypt(provider.apiKey)
    } catch {
      await logEvent("error", "provider-engine", "Failed to decrypt provider API key", {
        providerId: provider._id,
      })
      continue
    }

    // Retry logic
    for (let attempt = 0; attempt <= provider.maxRetries; attempt++) {
      const attemptStart = Date.now()

      const result = await callProviderApi(
        provider.apiUrl,
        apiKey,
        {
          service: ps.externalServiceId,
          quantity,
          url: targetUrl,
        },
        provider.timeoutMs
      )

      const attemptLatency = Date.now() - attemptStart
      totalLatency += attemptLatency

      if (result.success && result.orderId) {
        // Success - update order
        await Order.findByIdAndUpdate(orderId, {
          providerId: provider._id,
          providerServiceId: ps._id,
          providerOrderId: result.orderId,
          providerResponse: result.response,
          status: "PROVIDER_DISPATCHED",
          latencyMs: totalLatency,
        })

        await logEvent("info", "provider-engine", "Order dispatched successfully", {
          orderId,
          providerId: provider._id,
          providerOrderId: result.orderId,
          attempt: attempt + 1,
          latencyMs: attemptLatency,
        })

        return {
          success: true,
          providerId: provider._id.toString(),
          externalOrderId: result.orderId,
          rawResponse: result.response,
          latencyMs: totalLatency,
        }
      }

      lastError = result.error || "Unknown error"

      await logEvent("warn", "provider-engine", `Provider attempt ${attempt + 1} failed`, {
        orderId,
        providerId: provider._id,
        attempt: attempt + 1,
        error: lastError,
        latencyMs: attemptLatency,
      })

      // Wait before retry (exponential backoff)
      if (attempt < provider.maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    // This provider failed all attempts, try next
    lastError = `Provider ${provider.name} failed: ${lastError}`
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

  return {
    success: false,
    providerId: "",
    error: lastError,
    latencyMs: totalLatency,
  }
}

async function logEvent(
  level: "info" | "warn" | "error" | "debug",
  category: string,
  message: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    await SystemLog.create({
      level,
      category,
      message,
      metadata,
    })
  } catch (error) {
    console.error("Failed to log event:", error)
  }
}
