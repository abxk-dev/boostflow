import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { connectDB } from "@/lib/db"
import { FraudLog } from "@/lib/models"

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const severity = searchParams.get("severity")
    const ip = searchParams.get("ip")

    await connectDB()

    const query: Record<string, unknown> = {}

    if (severity) {
      query.severity = severity
    }

    if (ip) {
      query.ip = ip
    }

    const [logs, total] = await Promise.all([
      FraudLog.find(query)
        .populate("userId", "email username")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      FraudLog.countDocuments(query),
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
    console.error("Fraud logs fetch error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
