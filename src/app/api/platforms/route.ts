import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Platform } from "@/lib/models"

export async function GET() {
  try {
    await connectDB()

    const platforms = await Platform.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: platforms,
    })
  } catch (error) {
    console.error("Platforms fetch error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
