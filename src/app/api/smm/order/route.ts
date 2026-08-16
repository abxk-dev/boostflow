import { NextResponse } from "next/server"
import { SMMPanel } from "@/lib/smm-panel"

// POST /api/smm/order - Place order through SMM panel
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { apiKey, apiUrl, serviceId, link, quantity, comments } = body

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required" },
        { status: 400 }
      )
    }

    if (!serviceId || !link) {
      return NextResponse.json(
        { success: false, error: "serviceId and link are required" },
        { status: 400 }
      )
    }

    const panel = new SMMPanel({
      apiUrl: apiUrl || "https://smmlite.com/api/v2",
      apiKey,
    })

    let result

    if (comments && Array.isArray(comments) && comments.length > 0) {
      // Comment order
      result = await panel.addCommentOrder(serviceId, link, comments)
    } else if (quantity) {
      // Regular order
      result = await panel.addOrder(serviceId, link, quantity)
    } else {
      return NextResponse.json(
        { success: false, error: "quantity is required for non-comment orders" },
        { status: 400 }
      )
    }

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: result.order,
      },
    })
  } catch (error) {
    console.error("SMM order error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
