import { NextResponse } from "next/server"
import { SMMPanel } from "@/lib/smm-panel"

// GET /api/smm/status?order_id=xxx&key=xxx - Check order status
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("order_id")
    const apiKey = searchParams.get("key")
    const apiUrl = searchParams.get("api_url") || "https://smmlite.com/api/v2"

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required" },
        { status: 400 }
      )
    }

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "order_id is required" },
        { status: 400 }
      )
    }

    const panel = new SMMPanel({ apiUrl, apiKey })
    const status = await panel.getOrderStatus(parseInt(orderId))

    if (status.error) {
      return NextResponse.json({
        success: false,
        error: status.error,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        charge: status.charge,
        startCount: status.start_count,
        status: status.status,
        remains: status.remains,
        currency: status.currency,
        internalStatus: SMMPanel.mapStatus(status.status),
      },
    })
  } catch (error) {
    console.error("SMM status error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}

// POST /api/smm/status - Check multiple orders status
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { apiKey, apiUrl, orderIds } = body

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required" },
        { status: 400 }
      )
    }

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "orderIds array is required" },
        { status: 400 }
      )
    }

    if (orderIds.length > 100) {
      return NextResponse.json(
        { success: false, error: "Maximum 100 orders per request" },
        { status: 400 }
      )
    }

    const panel = new SMMPanel({
      apiUrl: apiUrl || "https://smmlite.com/api/v2",
      apiKey,
    })

    const statuses = await panel.getMultipleOrderStatus(orderIds.map(Number))

    // Map statuses to internal format
    const mapped = Object.entries(statuses).reduce((acc, [id, status]) => {
      acc[id] = {
        ...status,
        internalStatus: status.error ? "UNKNOWN" : SMMPanel.mapStatus(status.status),
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      success: true,
      data: mapped,
    })
  } catch (error) {
    console.error("SMM multi-status error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
