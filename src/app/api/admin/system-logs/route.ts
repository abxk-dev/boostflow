import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { connectDB } from "@/lib/db"
import { SystemLog } from "@/lib/models"

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "100")
    const level = searchParams.get("level")
    const category = searchParams.get("category")

    await connectDB()

    const query: Record<string, unknown> = {}

    if (level) {
      query.level = level
    }

    if (category) {
      query.category = category
    }

    const [logs, total] = await Promise.all([
      SystemLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SystemLog.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("System logs fetch error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
