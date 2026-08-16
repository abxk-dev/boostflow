import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { connectDB } from "@/lib/db"
import { Order, User, Service, Provider } from "@/lib/models"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    await connectDB()

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      totalUsers,
      activeServices,
      activeProviders,
      statusBreakdown,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: thisWeek } }),
      Order.countDocuments({ createdAt: { $gte: thisMonth } }),
      User.countDocuments(),
      Service.countDocuments({ isActive: true }),
      Provider.countDocuments({ isActive: true }),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Order.find()
        .populate("userId", "email username")
        .populate("serviceId", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ])

    const avgLatency = await Order.aggregate([
      { $match: { latencyMs: { $exists: true, $ne: null } } },
      { $group: { _id: null, avg: { $avg: "$latencyMs" } } },
    ])

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          todayOrders,
          weekOrders,
          monthOrders,
          totalUsers,
          activeServices,
          activeProviders,
          avgLatencyMs: avgLatency[0]?.avg || 0,
        },
        statusBreakdown: statusBreakdown.reduce(
          (acc: Record<string, number>, item: { _id: string; count: number }) => {
            acc[item._id] = item.count
            return acc
          },
          {}
        ),
        recentOrders,
      },
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
