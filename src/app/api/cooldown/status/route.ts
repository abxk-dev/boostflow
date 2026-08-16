import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/db"
import { Cooldown } from "@/lib/models"
import { parseSocialUrl } from "@/lib/url-parser"

const COOLDOWN_HOURS = 3
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000

function getIdentifier(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const ua = request.headers.get("user-agent") || "unknown"
  return `guest:${ip}:${ua.slice(0, 50)}`
}

/**
 * Check cooldown status for a given URL.
 * Returns both content-level and account-level cooldown info.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, platform, serviceId } = body

    if (!url || !platform || !serviceId) {
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

    const parsed = parseSocialUrl(url, platform)
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "Could not parse URL" },
        { status: 400 }
      )
    }

    await connectDB()

    const identifier = getIdentifier(request)
    const now = new Date()

    // Check content-level cooldown
    const contentCooldown = await Cooldown.findOne({
      identifier,
      platformSlug: platform,
      contentId: parsed.contentId,
      serviceId,
      expiresAt: { $gt: now },
    }).sort({ expiresAt: -1 })

    // Check account-level cooldown
    const accountCooldown = await Cooldown.findOne({
      identifier,
      platformSlug: platform,
      accountId: parsed.accountId,
      serviceId,
      expiresAt: { $gt: now },
    }).sort({ expiresAt: -1 })

    const contentLocked = !!contentCooldown
    const accountLocked = !!accountCooldown

    // The effective cooldown is whichever expires later
    let expiresAt: Date | null = null
    let cooldownType: string | null = null

    if (contentLocked && accountCooldown) {
      if (contentCooldown.expiresAt > accountCooldown.expiresAt) {
        expiresAt = contentCooldown.expiresAt
        cooldownType = "content"
      } else {
        expiresAt = accountCooldown.expiresAt
        cooldownType = "account"
      }
    } else if (contentLocked) {
      expiresAt = contentCooldown.expiresAt
      cooldownType = "content"
    } else if (accountLocked) {
      expiresAt = accountCooldown.expiresAt
      cooldownType = "account"
    }

    return NextResponse.json({
      success: true,
      data: {
        locked: contentLocked || accountLocked,
        cooldownType,
        expiresAt: expiresAt?.toISOString() || null,
        remainingMs: expiresAt ? Math.max(0, expiresAt.getTime() - now.getTime()) : 0,
        content: {
          id: parsed.contentId,
          locked: contentLocked,
          expiresAt: contentCooldown?.expiresAt?.toISOString() || null,
        },
        account: {
          id: parsed.accountId,
          locked: accountLocked,
          expiresAt: accountCooldown?.expiresAt?.toISOString() || null,
        },
      },
    })
  } catch (error) {
    console.error("Cooldown status error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to check cooldown" },
      { status: 500 }
    )
  }
}
