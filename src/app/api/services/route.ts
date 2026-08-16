import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Platform from "@/lib/models/Platform"
import Service from "@/lib/models/Service"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const platformSlug = searchParams.get("platform")

    let platforms
    if (platformSlug) {
      platforms = await Platform.find({ slug: platformSlug, isActive: true }).lean()
    } else {
      platforms = await Platform.find({ isActive: true }).sort({ sortOrder: 1 }).lean()
    }

    const platformIds = platforms.map((p) => p._id)
    const services = await Service.find({
      platformId: { $in: platformIds },
      isActive: true,
    })
      .populate("platformId")
      .sort({ sortOrder: 1 })
      .lean()

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
