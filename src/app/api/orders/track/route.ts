import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Order } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingId = searchParams.get("trackingId")

    if (!trackingId) {
      return NextResponse.json(
        { success: false, error: "Tracking ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

    const order = await Order.findOne({ trackingId })
      .populate("serviceId", "name description")
      .populate("platformId", "name slug icon")
      .populate("providerId", "name")
      .lean()

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id,
        requestId: order.requestId,
        trackingId: order.trackingId,
        serviceId: order.serviceId,
        platformId: order.platformId,
        targetUrl: order.targetUrl,
        quantity: order.quantity,
        status: order.status,
        isGuest: order.isGuest,
        providerId: order.providerId,
        providerOrderId: order.providerOrderId,
        failureReason: order.failureReason,
        startedAt: order.startedAt,
        completedAt: order.completedAt,
        createdAt: order.createdAt,
      },
    })
  } catch (error) {
    console.error("Track order error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}
