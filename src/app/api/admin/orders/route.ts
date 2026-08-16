import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { connectDB } from "@/lib/db"
import { Order } from "@/lib/models"

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status")
    const providerId = searchParams.get("providerId")
    const search = searchParams.get("search")

    await connectDB()

    const query: Record<string, unknown> = {}

    if (status) {
      query.status = status
    }

    if (providerId) {
      query.providerId = providerId
    }

    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: "i" } },
        { providerOrderId: { $regex: search, $options: "i" } },
        { targetUrl: { $regex: search, $options: "i" } },
      ]
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "email username")
        .populate("serviceId", "name")
        .populate("platformId", "name slug")
        .populate("providerId", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Admin orders fetch error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
