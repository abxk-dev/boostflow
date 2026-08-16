import { NextRequest, NextResponse } from "next/server"
import { getOrderByTrackingId, SAMPLE_PLATFORMS, SAMPLE_SERVICES, getServiceById } from "@/lib/dev-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingId = searchParams.get("trackingId")

    if (!trackingId) {
      return NextResponse.json({ success: false, error: "Tracking ID is required" }, { status: 400 })
    }

    // Search for order by tracking ID
    const foundOrder = getOrderByTrackingId(trackingId)

    if (!foundOrder) {
      // For demo purposes, return a sample order if tracking ID matches pattern
      if (trackingId.startsWith("BF-") && trackingId.length === 11) {
        const service = getServiceById("svc-1")
        const sampleOrder = {
          orderId: "sample-order-1",
          requestId: "sample-request-1",
          trackingId,
          serviceId: service || { name: "Instagram Views", description: "Get real views for your Instagram posts" },
          platformId: SAMPLE_PLATFORMS[0] || { name: "Instagram", slug: "instagram" },
          targetUrl: "https://instagram.com/p/sample",
          quantity: 1000,
          status: "IN_PROGRESS",
          isGuest: true,
          startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          ip: "127.0.0.1",
        }

        return NextResponse.json({
          success: true,
          data: sampleOrder,
        })
      }

      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const platform = SAMPLE_PLATFORMS.find(p => p._id === foundOrder.platformId)
    const service = getServiceById(foundOrder.serviceId)

    return NextResponse.json({
      success: true,
      data: {
        ...foundOrder,
        platformId: platform || { name: "Instagram", slug: "instagram" },
        serviceId: service || { name: "Instagram Views", description: "Get real views for your Instagram posts" },
      },
    })
  } catch (error) {
    console.error("Track order error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 })
  }
}
