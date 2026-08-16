import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { AdVerification } from "@/lib/models"
import { v4 as uuidv4 } from "uuid"

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

// Verify ad completion and issue a verification token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, adNetworkToken } = body

    if (!platform || !["instagram", "tiktok"].includes(platform)) {
      return NextResponse.json(
        { success: false, error: "Invalid platform" },
        { status: 400 }
      )
    }

    if (!adNetworkToken) {
      return NextResponse.json(
        { success: false, error: "Ad network token required" },
        { status: 400 }
      )
    }

    await connectDB()

    const identifier = getIdentifier(request)
    const ip = getClientIp(request)
    const now = new Date()

    // Check for recent ad completion (prevent rapid-fire — minimum 30 seconds between ads)
    const recentAd = await AdVerification.findOne({
      identifier,
      platformSlug: platform,
      createdAt: { $gte: new Date(now.getTime() - 30000) },
    })

    if (recentAd) {
      return NextResponse.json(
        { success: false, error: "Please wait before verifying another ad" },
        { status: 429 }
      )
    }

    // TODO: In production, validate adNetworkToken with the actual ad network API
    // For now, we accept any non-empty token as valid
    // In production, you would call the ad network's verification endpoint:
    // const isValid = await verifyWithAdNetwork(adNetworkToken)
    const isValid = adNetworkToken && adNetworkToken.length > 5

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Ad verification failed" },
        { status: 400 }
      )
    }

    // Issue verification token (valid for 10 minutes)
    const verificationId = uuidv4()
    await AdVerification.create({
      verificationId,
      identifier,
      platformSlug: platform,
      ip,
      isUsed: false,
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
    })

    return NextResponse.json({
      success: true,
      data: {
        verificationId,
        expiresAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error("Ad verification error:", error)
    return NextResponse.json(
      { success: false, error: "Ad verification failed" },
      { status: 500 }
    )
  }
}

// Check if a verification token is valid (used internally by order API)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const verificationId = searchParams.get("token")

    if (!verificationId) {
      return NextResponse.json(
        { success: false, error: "Verification token required" },
        { status: 400 }
      )
    }

    await connectDB()

    const verification = await AdVerification.findOne({
      verificationId,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    })

    return NextResponse.json({
      success: true,
      data: {
        valid: !!verification,
        platform: verification?.platformSlug || null,
      },
    })
  } catch (error) {
    console.error("Ad check error:", error)
    return NextResponse.json(
      { success: false, error: "Check failed" },
      { status: 500 }
    )
  }
}
