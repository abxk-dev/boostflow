import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Order, AdReward, Service, Platform, User, FraudLog } from "@/lib/models"
import { orderSubmissionSchema, validateUrlForPlatform } from "@/lib/validations"
import { getClientIp, sanitizeString } from "@/lib/utils"
import { checkRateLimit } from "@/lib/rate-limit"
import { dispatchOrder } from "@/lib/provider-engine"
import { ZodError } from "zod"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const userId = (session.user as { id: string }).id
    const ip = getClientIp(request.headers)

    // Rate limit order submissions
    const rateLimit = await checkRateLimit(`order:${userId}`, "order", {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many order attempts" },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validatedData = orderSubmissionSchema.parse(body)

    await connectDB()

    // Check for duplicate requestId (idempotency)
    const existingOrder = await Order.findOne({ requestId: validatedData.requestId })
    if (existingOrder) {
      return NextResponse.json({
        success: true,
        data: {
          orderId: existingOrder._id,
          status: existingOrder.status,
          message: "Order already exists",
        },
      })
    }

    // Verify and consume reward token
    const reward = await AdReward.findOne({
      rewardToken: validatedData.rewardToken,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    })

    if (!reward) {
      await FraudLog.create({
        userId,
        ip,
        reason: "Invalid or expired reward token",
        severity: "high",
        metadata: {
          rewardToken: validatedData.rewardToken.slice(0, 8) + "...",
          serviceId: validatedData.serviceId,
        },
      })

      return NextResponse.json(
        { success: false, error: "Invalid or expired reward token" },
        { status: 400 }
      )
    }

    // Verify reward matches user and service
    if (
      !reward.userId || reward.userId.toString() !== userId ||
      !reward.serviceId || reward.serviceId.toString() !== validatedData.serviceId
    ) {
      await FraudLog.create({
        userId,
        ip,
        reason: "Reward token mismatch",
        severity: "critical",
        metadata: {
          rewardUserId: reward.userId,
          requestUserId: userId,
          rewardServiceId: reward.serviceId,
          requestServiceId: validatedData.serviceId,
        },
      })

      return NextResponse.json(
        { success: false, error: "Reward token validation failed" },
        { status: 400 }
      )
    }

    // Verify service exists
    const service = await Service.findById(validatedData.serviceId)
    if (!service || !service.isActive) {
      return NextResponse.json(
        { success: false, error: "Service not found or inactive" },
        { status: 404 }
      )
    }

    // Validate quantity
    if (
      validatedData.quantity < service.minQuantity ||
      validatedData.quantity > service.maxQuantity
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Quantity must be between ${service.minQuantity} and ${service.maxQuantity}`,
        },
        { status: 400 }
      )
    }

    // Get platform for URL validation
    const platform = await Platform.findById(service.platformId)
    if (!platform || !platform.isActive) {
      return NextResponse.json(
        { success: false, error: "Platform not available" },
        { status: 400 }
      )
    }

    // Validate URL matches platform pattern
    if (!validateUrlForPlatform(validatedData.targetUrl, platform.slug)) {
      return NextResponse.json(
        { success: false, error: `Invalid URL for ${platform.name}` },
        { status: 400 }
      )
    }

    // Check user daily limits
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Reset daily count if needed
    const now = new Date()
    const lastReset = new Date(user.lastOrderReset)
    if (
      now.getDate() !== lastReset.getDate() ||
      now.getMonth() !== lastReset.getMonth()
    ) {
      user.dailyOrderCount = 0
      user.lastOrderReset = now
    }

    // Check free tier limits
    if (service.isFreeTier && user.dailyOrderCount >= service.dailyFreeLimit) {
      return NextResponse.json(
        {
          success: false,
          error: `Daily limit reached (${service.dailyFreeLimit} orders per day)`,
        },
        { status: 429 }
      )
    }

    // Mark reward as used
    reward.isUsed = true
    reward.usedAt = now
    await reward.save()

    // Create order
    const order = await Order.create({
      requestId: validatedData.requestId,
      userId,
      serviceId: validatedData.serviceId,
      platformId: service.platformId,
      targetUrl: sanitizeString(validatedData.targetUrl),
      quantity: validatedData.quantity,
      status: "ORDER_QUEUED",
      rewardToken: validatedData.rewardToken,
      startedAt: now,
      ip,
    })

    // Update user order count
    user.dailyOrderCount += 1
    await user.save()

    // Dispatch to provider asynchronously
    dispatchOrder(
      order._id,
      service._id,
      validatedData.quantity,
      validatedData.targetUrl
    ).catch((error) => {
      console.error("Provider dispatch error:", error)
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        message: "Order submitted successfully",
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues?.[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || "Validation error" },
        { status: 400 }
      )
    }

    console.error("Order submission error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const userId = (session.user as { id: string }).id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")

    await connectDB()

    const query: Record<string, unknown> = { userId }
    if (status) {
      query.status = status
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("serviceId", "name description")
        .populate("platformId", "name slug icon")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
