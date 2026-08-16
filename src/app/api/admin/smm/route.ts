import { NextResponse } from "next/server"
import { SMMPanel } from "@/lib/smm-panel"

// POST /api/admin/smm - Configure SMM panel or sync services
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, apiKey, apiUrl } = body

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required" },
        { status: 400 }
      )
    }

    const panel = new SMMPanel({
      apiUrl: apiUrl || "https://smmlite.com/api/v2",
      apiKey,
    })

    switch (action) {
      case "test": {
        // Test connection by getting balance
        const balance = await panel.getBalance()
        if (balance.error) {
          return NextResponse.json({
            success: false,
            error: balance.error,
          })
        }
        return NextResponse.json({
          success: true,
          data: {
            balance: balance.balance,
            currency: balance.currency,
          },
        })
      }

      case "sync_services": {
        // Fetch all services from SMM panel
        const services = await panel.getServices()

        // Group by category
        const grouped = services.reduce((acc, service) => {
          const category = service.category || "Uncategorized"
          if (!acc[category]) acc[category] = []
          acc[category].push(service)
          return acc
        }, {} as Record<string, typeof services>)

        return NextResponse.json({
          success: true,
          data: {
            total: services.length,
            categories: Object.keys(grouped).length,
            services: grouped,
          },
        })
      }

      case "get_balance": {
        const balance = await panel.getBalance()
        return NextResponse.json({
          success: !balance.error,
          data: balance,
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("SMM panel API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}

// GET /api/admin/smm?action=services&key=xxx - Get services list
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action")
    const apiKey = searchParams.get("key")

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required" },
        { status: 400 }
      )
    }

    const panel = new SMMPanel({
      apiUrl: "https://smmlite.com/api/v2",
      apiKey,
    })

    switch (action) {
      case "services": {
        const services = await panel.getServices()
        return NextResponse.json({
          success: true,
          data: services,
        })
      }

      case "balance": {
        const balance = await panel.getBalance()
        return NextResponse.json({
          success: !balance.error,
          data: balance,
        })
      }

      case "order_status": {
        const orderId = searchParams.get("order_id")
        if (!orderId) {
          return NextResponse.json(
            { success: false, error: "order_id is required" },
            { status: 400 }
          )
        }
        const status = await panel.getOrderStatus(parseInt(orderId))
        return NextResponse.json({
          success: !status.error,
          data: status,
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("SMM panel API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
