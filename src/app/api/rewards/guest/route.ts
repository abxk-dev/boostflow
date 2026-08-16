import { NextRequest, NextResponse } from "next/server"
import { generateSecureToken } from "@/lib/crypto"
import { getClientIp } from "@/lib/utils"
import { addReward, getRewardStore } from "@/lib/dev-store"

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)

    const body = await request.json()
    const { serviceId, sessionId, requestId } = body

    if (!serviceId || !sessionId || !requestId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check for duplicate reward tokens by IP (potential abuse)
    const rewardStore = getRewardStore()
    const recentRewards = Array.from(rewardStore.values()).filter(
      (r) => r.ip === ip && r.serviceId === serviceId &&
             r.createdAt > new Date(Date.now() - 2 * 60 * 1000)
    )

    if (recentRewards.length > 0) {
      return NextResponse.json(
        { success: false, error: "Please wait before requesting another reward" },
        { status: 429 }
      )
    }

    // Generate reward token
    const rewardToken = generateSecureToken(32)
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes TTL

    // Store reward
    addReward({
      rewardToken,
      serviceId,
      ip,
      expiresAt,
      isUsed: false,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      data: {
        rewardToken,
        expiresAt: expiresAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Guest reward claim error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
