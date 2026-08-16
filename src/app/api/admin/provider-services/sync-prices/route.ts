import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { connectDB } from "@/lib/db"
import { ProviderService, Provider } from "@/lib/models"
import { decrypt } from "@/lib/crypto"
import { SMMPanel } from "@/lib/smm-panel"

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { providerId } = body

    await connectDB()

    // Get provider
    const provider = providerId
      ? await Provider.findById(providerId)
      : await Provider.findOne({ name: /smmlite/i })

    if (!provider) {
      return NextResponse.json(
        { success: false, error: "Provider not found" },
        { status: 404 }
      )
    }

    // Decrypt API key
    let apiKey: string
    try {
      apiKey = decrypt(provider.apiKey)
    } catch {
      apiKey = provider.apiKey
    }

    if (!apiKey || apiKey === "REPLACE_WITH_YOUR_KEY") {
      return NextResponse.json(
        { success: false, error: "API key not configured" },
        { status: 400 }
      )
    }

    // Fetch all services from smmlite
    const panel = new SMMPanel({
      apiUrl: provider.apiUrl,
      apiKey,
    })

    const remoteServices = await panel.getServices()

    // Get all provider-service mappings for this provider
    const mappings = await ProviderService.find({
      providerId: provider._id,
      isActive: true,
    })

    // Match and update prices
    const updates: Array<{
      service: string
      externalId: string
      oldPrice: number
      newPrice: number
    }> = []

    for (const mapping of mappings) {
      const remote = remoteServices.find(
        (r) => r.service.toString() === mapping.externalServiceId
      )

      if (remote) {
        const newPrice = parseFloat(remote.rate) || 0
        const oldPrice = mapping.costPerUnit

        if (newPrice !== oldPrice) {
          mapping.costPerUnit = newPrice
          await mapping.save()
          updates.push({
            service: mapping.serviceId.toString(),
            externalId: mapping.externalServiceId,
            oldPrice,
            newPrice,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRemote: remoteServices.length,
        totalMappings: mappings.length,
        updated: updates.length,
        updates,
      },
    })
  } catch (error: any) {
    console.error("Sync prices error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync prices" },
      { status: 500 }
    )
  }
}
