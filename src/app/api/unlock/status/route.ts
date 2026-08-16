import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { QuantityUnlock } from "@/lib/models"
import { QUANTITY_LEVELS } from "@/types"

function getIdentifier(request: NextRequest): string {
  // Use IP + user-agent as guest identifier
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const ua = request.headers.get("user-agent") || "unknown"
  return `guest:${ip}:${ua.slice(0, 50)}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get("platform")

    if (!platform || !["instagram", "tiktok"].includes(platform)) {
      return NextResponse.json(
        { success: false, error: "Invalid platform" },
        { status: 400 }
      )
    }

    await connectDB()

    const identifier = getIdentifier(request)
    const unlock = await QuantityUnlock.findOne({
      identifier,
      platformSlug: platform,
    })

    const now = new Date()

    if (!unlock) {
      // New user — Level 1
      return NextResponse.json({
        success: true,
        data: {
          currentLevel: 1,
          maxQuantity: QUANTITY_LEVELS[0].maxQuantity,
          levels: QUANTITY_LEVELS.map((l) => ({
            level: l.level,
            maxQuantity: l.maxQuantity,
            unlocked: l.level === 1,
            unlockAfterHours: l.unlockAfterHours,
          })),
          nextUnlockAt: null,
          canUnlockNext: false,
          totalOrders: 0,
        },
      })
    }

    // Check if next level can be unlocked
    let currentLevel = unlock.currentLevel
    let nextUnlockAt = unlock.nextUnlockAt

    // Auto-advance levels if time has passed
    while (currentLevel < 3 && nextUnlockAt && now >= nextUnlockAt) {
      currentLevel++
      const nextLevelConfig = QUANTITY_LEVELS.find((l) => l.level === currentLevel + 1)
      if (nextLevelConfig && currentLevel < 3) {
        nextUnlockAt = new Date(nextUnlockAt.getTime() + nextLevelConfig.unlockAfterHours * 3600000)
      } else {
        nextUnlockAt = null
      }
    }

    // Update DB if level changed
    if (currentLevel !== unlock.currentLevel) {
      unlock.currentLevel = currentLevel
      unlock.nextUnlockAt = nextUnlockAt
      await unlock.save()
    }

    const currentLevelConfig = QUANTITY_LEVELS.find((l) => l.level === currentLevel)!

    return NextResponse.json({
      success: true,
      data: {
        currentLevel,
        maxQuantity: currentLevelConfig.maxQuantity,
        levels: QUANTITY_LEVELS.map((l) => ({
          level: l.level,
          maxQuantity: l.maxQuantity,
          unlocked: l.level <= currentLevel,
          unlockAfterHours: l.unlockAfterHours,
        })),
        nextUnlockAt: nextUnlockAt?.toISOString() || null,
        canUnlockNext: currentLevel < 3 && nextUnlockAt ? now >= nextUnlockAt : false,
        totalOrders: unlock.totalOrders,
      },
    })
  } catch (error) {
    console.error("Unlock status error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to get unlock status" },
      { status: 500 }
    )
  }
}

// Advance unlock level after successful order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform } = body

    if (!platform || !["instagram", "tiktok"].includes(platform)) {
      return NextResponse.json(
        { success: false, error: "Invalid platform" },
        { status: 400 }
      )
    }

    await connectDB()

    const identifier = getIdentifier(request)
    const now = new Date()

    let unlock = await QuantityUnlock.findOne({
      identifier,
      platformSlug: platform,
    })

    if (!unlock) {
      // First order — create record at Level 1
      const nextLevelConfig = QUANTITY_LEVELS.find((l) => l.level === 2)
      unlock = await QuantityUnlock.create({
        identifier,
        platformSlug: platform,
        currentLevel: 1,
        levelUnlockedAt: now,
        nextUnlockAt: nextLevelConfig
          ? new Date(now.getTime() + nextLevelConfig.unlockAfterHours * 3600000)
          : null,
        totalOrders: 1,
      })
    } else {
      unlock.totalOrders++

      // Check if we can advance
      if (unlock.currentLevel < 3 && unlock.nextUnlockAt && now >= unlock.nextUnlockAt) {
        unlock.currentLevel++
        const nextLevelConfig = QUANTITY_LEVELS.find((l) => l.level === unlock!.currentLevel + 1)
        unlock.levelUnlockedAt = now
        unlock.nextUnlockAt = nextLevelConfig
          ? new Date(now.getTime() + nextLevelConfig.unlockAfterHours * 3600000)
          : null
      } else if (unlock.currentLevel < 3 && !unlock.nextUnlockAt) {
        // Set timer for next level
        const nextLevelConfig = QUANTITY_LEVELS.find((l) => l.level === unlock!.currentLevel + 1)
        if (nextLevelConfig) {
          unlock.nextUnlockAt = new Date(now.getTime() + nextLevelConfig.unlockAfterHours * 3600000)
        }
      }

      await unlock.save()
    }

    const currentLevelConfig = QUANTITY_LEVELS.find((l) => l.level === unlock!.currentLevel)!

    return NextResponse.json({
      success: true,
      data: {
        currentLevel: unlock.currentLevel,
        maxQuantity: currentLevelConfig.maxQuantity,
        nextUnlockAt: unlock.nextUnlockAt?.toISOString() || null,
        totalOrders: unlock.totalOrders,
      },
    })
  } catch (error) {
    console.error("Unlock advance error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to advance unlock" },
      { status: 500 }
    )
  }
}
