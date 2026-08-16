import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/db"
import {
  Order,
  AdVerification,
  QuantityUnlock,
  Cooldown,
  Service,
  Platform,
  ProviderService,
  Provider,
} from "@/lib/models"
import { validateUrlForPlatform } from "@/lib/validations"
import { QUANTITY_LEVELS } from "@/types"
import { parseSocialUrl } from "@/lib/url-parser"
import { v4 as uuidv4 } from "uuid"
import { SMMPanel } from "@/lib/smm-panel"
import { decrypt } from "@/lib/crypto"

const COOLDOWN_HOURS = 3
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000

function getIdentifier(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const ua = request.headers.get("user-agent") || "unknown"
  return `guest:${ip}:${ua.slice(0, 50)}`
}

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
}

function formatRemaining(ms: number): string {
  const hours = Math.floor(ms / 3600000)
  const mins = Math.floor((ms % 3600000) / 60000)
  return `${hours}h ${mins}m`
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const identifier = getIdentifier(request)

    const body = await request.json()
    const { requestId, verificationId, serviceId, targetUrl, quantity } = body

    // Basic validation
    if (!requestId || !verificationId || !serviceId || !targetUrl || !quantity) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { success: false, error: "Invalid service ID" },
        { status: 400 }
      )
    }

    await connectDB()

    // 1. Check for duplicate requestId (idempotency)
    const existingOrder = await Order.findOne({ requestId })
    if (existingOrder) {
      return NextResponse.json({
        success: true,
        data: {
          orderId: existingOrder._id,
          trackingId: existingOrder.trackingId,
          status: existingOrder.status,
          message: "Order already exists",
        },
      })
    }

    // 2. Verify ad completion token (server-side enforcement)
    const adVerification = await AdVerification.findOne({
      verificationId,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    })

    if (!adVerification) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired ad verification. Please watch the ad again." },
        { status: 400 }
      )
    }

    if (adVerification.identifier !== identifier) {
      return NextResponse.json(
        { success: false, error: "Ad verification mismatch" },
        { status: 400 }
      )
    }

    // 3. Verify service exists and get platform
    const service = await Service.findById(serviceId).populate("platformId")
    if (!service || !service.isActive) {
      return NextResponse.json(
        { success: false, error: "Service not found or inactive" },
        { status: 404 }
      )
    }

    const platform = service.platformId as any
    if (!platform || !platform.isActive) {
      return NextResponse.json(
        { success: false, error: "Platform not available" },
        { status: 400 }
      )
    }

    // Verify ad was for the same platform
    if (adVerification.platformSlug !== platform.slug) {
      return NextResponse.json(
        { success: false, error: "Ad verification platform mismatch" },
        { status: 400 }
      )
    }

    // 4. Validate URL matches platform
    if (!validateUrlForPlatform(targetUrl, platform.slug)) {
      return NextResponse.json(
        { success: false, error: `Invalid URL for ${platform.name}` },
        { status: 400 }
      )
    }

    // 5. Parse URL to extract content and account IDs
    const parsed = parseSocialUrl(targetUrl, platform.slug)
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "Could not parse content URL" },
        { status: 400 }
      )
    }

    // 6. Check content-level cooldown (same link)
    const now = new Date()
    const contentCooldown = await Cooldown.findOne({
      identifier,
      platformSlug: platform.slug,
      contentId: parsed.contentId,
      serviceId,
      expiresAt: { $gt: now },
    })

    if (contentCooldown) {
      const remaining = contentCooldown.expiresAt.getTime() - now.getTime()
      return NextResponse.json(
        {
          success: false,
          error: `You have already boosted this link. You can order again after ${formatRemaining(remaining)}.`,
          cooldownType: "content",
          expiresAt: contentCooldown.expiresAt.toISOString(),
          remainingMs: remaining,
        },
        { status: 429 }
      )
    }

    // 7. Check account-level cooldown (same account, any content)
    const accountCooldown = await Cooldown.findOne({
      identifier,
      platformSlug: platform.slug,
      accountId: parsed.accountId,
      serviceId,
      expiresAt: { $gt: now },
    })

    if (accountCooldown) {
      const remaining = accountCooldown.expiresAt.getTime() - now.getTime()
      return NextResponse.json(
        {
          success: false,
          error: `You have already boosted this account. You can place another order after ${formatRemaining(remaining)}.`,
          cooldownType: "account",
          expiresAt: accountCooldown.expiresAt.toISOString(),
          remainingMs: remaining,
        },
        { status: 429 }
      )
    }

    // 8. Enforce quantity unlock limits (server-side)
    const unlock = await QuantityUnlock.findOne({
      identifier,
      platformSlug: platform.slug,
    })

    const currentLevel = unlock?.currentLevel || 1
    let effectiveLevel = currentLevel
    if (unlock?.nextUnlockAt && now >= unlock.nextUnlockAt) {
      effectiveLevel = Math.min(currentLevel + 1, 3)
    }

    const effectiveConfig = QUANTITY_LEVELS.find((l) => l.level === effectiveLevel)!

    if (quantity > effectiveConfig.maxQuantity) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum quantity for your level is ${effectiveConfig.maxQuantity}. You are at Level ${effectiveLevel}.`,
          maxQuantity: effectiveConfig.maxQuantity,
          currentLevel: effectiveLevel,
        },
        { status: 400 }
      )
    }

    if (quantity < service.minQuantity) {
      return NextResponse.json(
        { success: false, error: `Minimum quantity is ${service.minQuantity}` },
        { status: 400 }
      )
    }

    // 9. Generate tracking ID
    const trackingId = `BF-${uuidv4().slice(0, 8).toUpperCase()}`

    // 10. Mark ad verification as used
    adVerification.isUsed = true
    adVerification.usedAt = now
    await adVerification.save()

    // 11. Create order
    const order = await Order.create({
      requestId,
      trackingId,
      isGuest: true,
      serviceId: service._id,
      platformId: platform._id,
      targetUrl,
      quantity,
      status: "ORDER_QUEUED",
      startedAt: now,
      ip,
    })

    // 12. Create cooldown records
    const expiresAt = new Date(now.getTime() + COOLDOWN_MS)

    // Content-level cooldown
    await Cooldown.create({
      identifier,
      platformSlug: platform.slug,
      accountId: parsed.accountId,
      contentId: parsed.contentId,
      serviceId: service._id,
      expiresAt,
    })

    // 13. Update quantity unlock progress
    if (!unlock) {
      const nextLevelConfig = QUANTITY_LEVELS.find((l) => l.level === 2)
      await QuantityUnlock.create({
        identifier,
        platformSlug: platform.slug,
        currentLevel: 1,
        levelUnlockedAt: now,
        nextUnlockAt: nextLevelConfig
          ? new Date(now.getTime() + nextLevelConfig.unlockAfterHours * 3600000)
          : null,
        totalOrders: 1,
      })
    } else {
      unlock.totalOrders++

      if (unlock.currentLevel < 3 && unlock.nextUnlockAt && now >= unlock.nextUnlockAt) {
        unlock.currentLevel++
        const nextLevelConfig = QUANTITY_LEVELS.find((l) => l.level === unlock!.currentLevel + 1)
        unlock.levelUnlockedAt = now
        unlock.nextUnlockAt = nextLevelConfig
          ? new Date(now.getTime() + nextLevelConfig.unlockAfterHours * 3600000)
          : null
      } else if (unlock.currentLevel < 3 && !unlock.nextUnlockAt) {
        const nextLevelConfig = QUANTITY_LEVELS.find((l) => l.level === unlock!.currentLevel + 1)
        if (nextLevelConfig) {
          unlock.nextUnlockAt = new Date(now.getTime() + nextLevelConfig.unlockAfterHours * 3600000)
        }
      }

      await unlock.save()
    }

    // 14. Dispatch to provider
    dispatchToProvider(order._id, service._id, platform.slug, quantity, targetUrl).catch(
      (err) => console.error("Provider dispatch error:", err)
    )

    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id,
        trackingId,
        status: order.status,
        message: "Order submitted successfully",
      },
    })
  } catch (error) {
    console.error("Guest order submission error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

async function dispatchToProvider(
  orderId: any,
  serviceId: any,
  platformSlug: string,
  quantity: number,
  targetUrl: string
) {
  try {
    const providerService = await ProviderService.findOne({
      serviceId,
      isActive: true,
      minQuantity: { $lte: quantity },
      maxQuantity: { $gte: quantity },
    }).populate("providerId")

    if (!providerService) {
      await Order.findByIdAndUpdate(orderId, {
        status: "FAILED",
        failureReason: "No provider available",
        failedAt: new Date(),
      })
      return
    }

    const provider = providerService.providerId as any
    if (!provider || !provider.isActive) {
      await Order.findByIdAndUpdate(orderId, {
        status: "FAILED",
        failureReason: "Provider inactive",
        failedAt: new Date(),
      })
      return
    }

    let apiKey: string
    try {
      apiKey = decrypt(provider.apiKey)
    } catch {
      apiKey = provider.apiKey
    }

    const panel = new SMMPanel({
      apiUrl: provider.apiUrl,
      apiKey,
    })

    const startTime = Date.now()
    const result = await panel.addOrder(
      parseInt(providerService.externalServiceId),
      targetUrl,
      quantity
    )
    const latencyMs = Date.now() - startTime

    if (result.order) {
      await Order.findByIdAndUpdate(orderId, {
        providerId: provider._id,
        providerServiceId: providerService._id,
        providerOrderId: result.order.toString(),
        providerResponse: result as any,
        status: "PROVIDER_DISPATCHED",
        latencyMs,
      })
    } else {
      await Order.findByIdAndUpdate(orderId, {
        status: "FAILED",
        failureReason: result.error || "Provider rejected order",
        failedAt: new Date(),
        latencyMs,
      })
    }
  } catch (error) {
    console.error("Dispatch error:", error)
    await Order.findByIdAndUpdate(orderId, {
      status: "FAILED",
      failureReason: error instanceof Error ? error.message : "Dispatch failed",
      failedAt: new Date(),
    })
  }
}
