import { NextRequest, NextResponse } from "next/server"

// Sample platforms for development
const SAMPLE_PLATFORMS = [
  { _id: "plat-1", name: "Instagram", slug: "instagram", icon: "instagram" },
  { _id: "plat-2", name: "TikTok", slug: "tiktok", icon: "tiktok" },
]

// Sample services for development
const SAMPLE_SERVICES = [
  {
    _id: "svc-1",
    name: "Instagram Views",
    description: "Get real views for your Instagram reels and posts",
    minQuantity: 100,
    maxQuantity: 100000,
    isFreeTier: true,
    dailyFreeLimit: 1000,
    platformId: SAMPLE_PLATFORMS[0],
    sortOrder: 1,
  },
  {
    _id: "svc-2",
    name: "Instagram Likes",
    description: "Boost engagement with real likes on your content",
    minQuantity: 50,
    maxQuantity: 50000,
    isFreeTier: true,
    dailyFreeLimit: 500,
    platformId: SAMPLE_PLATFORMS[0],
    sortOrder: 2,
  },
  {
    _id: "svc-3",
    name: "Instagram Followers",
    description: "Grow your audience with real followers",
    minQuantity: 100,
    maxQuantity: 10000,
    isFreeTier: false,
    dailyFreeLimit: 0,
    platformId: SAMPLE_PLATFORMS[0],
    sortOrder: 3,
  },
  {
    _id: "svc-4",
    name: "TikTok Views",
    description: "Get real views for your TikTok videos",
    minQuantity: 500,
    maxQuantity: 500000,
    isFreeTier: true,
    dailyFreeLimit: 2000,
    platformId: SAMPLE_PLATFORMS[1],
    sortOrder: 1,
  },
  {
    _id: "svc-5",
    name: "TikTok Likes",
    description: "Boost your TikTok engagement with real likes",
    minQuantity: 100,
    maxQuantity: 100000,
    isFreeTier: true,
    dailyFreeLimit: 1000,
    platformId: SAMPLE_PLATFORMS[1],
    sortOrder: 2,
  },
  {
    _id: "svc-6",
    name: "TikTok Followers",
    description: "Grow your TikTok following with real users",
    minQuantity: 100,
    maxQuantity: 50000,
    isFreeTier: false,
    dailyFreeLimit: 0,
    platformId: SAMPLE_PLATFORMS[1],
    sortOrder: 3,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platformSlug = searchParams.get("platform")

    let services = SAMPLE_SERVICES

    // Filter by platform if specified
    if (platformSlug) {
      services = services.filter(
        (s) => s.platformId.slug === platformSlug
      )
    }

    return NextResponse.json({
      success: true,
      data: services,
    })
  } catch (error) {
    console.error("Services fetch error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
