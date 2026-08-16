import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { AdReward, Service, FraudLog } from "@/lib/models"
import { adRewardClaimSchema } from "@/lib/validations"
import { generateSecureToken } from "@/lib/crypto"
import { getClientIp } from "@/lib/utils"
import { checkRateLimit } from "@/lib/rate-limit"
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

    // Rate limit reward claims
    const rateLimit = await checkRateLimit(`reward:${userId}`, "reward", {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validatedData = adRewardClaimSchema.parse(body)

    await connectDB()

    // Verify service exists and is active
    const service = await Service.findById(validatedData.serviceId)
    if (!service || !service.isActive) {
      return NextResponse.json(
        { success: false, error: "Service not found or inactive" },
        { status: 404 }
      )
    }

    // Check for duplicate reward tokens (potential abuse)
    const recentReward = await AdReward.findOne({
      userId,
      serviceId: validatedData.serviceId,
      createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) }, // Last 2 minutes
    })

    if (recentReward) {
      // Log potential abuse
      await FraudLog.create({
        userId,
        ip,
        reason: "Duplicate reward claim attempt",
        severity: "medium",
        metadata: {
          serviceId: validatedData.serviceId,
          lastRewardAt: recentReward.createdAt,
        },
      })

      return NextResponse.json(
        { success: false, error: "Please wait before requesting another reward" },
        { status: 429 }
      )
    }

    // Generate reward token
    const rewardToken = generateSecureToken(32)
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes TTL

    // Create reward entry
    const reward = await AdReward.create({
      rewardToken,
      userId,
      sessionId: validatedData.sessionId,
      serviceId: validatedData.serviceId,
      ip,
      requestId: validatedData.requestId,
      expiresAt,
    })

    return NextResponse.json({
      success: true,
      data: {
        rewardToken: reward.rewardToken,
        expiresAt: reward.expiresAt,
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

    console.error("Reward claim error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
