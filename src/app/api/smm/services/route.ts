import { NextResponse } from "next/server"
import { SMMPanel } from "@/lib/smm-panel"

// GET /api/smm/services?key=xxx - Get available services
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const apiKey = searchParams.get("key")
    const apiUrl = searchParams.get("api_url") || "https://smmlite.com/api/v2"
    const category = searchParams.get("category")
    const platform = searchParams.get("platform")

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required" },
        { status: 400 }
      )
    }

    const panel = new SMMPanel({ apiUrl, apiKey })
    const services = await panel.getServices()

    // Filter by category if provided
    let filtered = services
    if (category) {
      filtered = filtered.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Filter by platform name if provided
    if (platform) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(platform.toLowerCase())
      )
    }

    // Group by category
    const grouped = filtered.reduce((acc, service) => {
      const cat = service.category || "Uncategorized"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(service)
      return acc
    }, {} as Record<string, typeof services>)

    return NextResponse.json({
      success: true,
      data: {
        total: filtered.length,
        categories: Object.keys(grouped).length,
        services: grouped,
        raw: filtered,
      },
    })
  } catch (error) {
    console.error("SMM services error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
