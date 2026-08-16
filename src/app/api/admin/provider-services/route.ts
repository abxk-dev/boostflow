import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { connectDB } from "@/lib/db"
import { ProviderService } from "@/lib/models"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    await connectDB()

    const providerServices = await ProviderService.find()
      .populate("providerId", "name")
      .populate("serviceId", "name")
      .sort({ priority: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: providerServices,
    })
  } catch (error) {
    console.error("Provider services fetch error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { id, externalServiceId, costPerUnit, isActive, priority, minQuantity, maxQuantity } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Provider Service ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

    const updateData: Record<string, unknown> = {}
    if (externalServiceId !== undefined) updateData.externalServiceId = externalServiceId
    if (costPerUnit !== undefined) updateData.costPerUnit = costPerUnit
    if (isActive !== undefined) updateData.isActive = isActive
    if (priority !== undefined) updateData.priority = priority
    if (minQuantity !== undefined) updateData.minQuantity = minQuantity
    if (maxQuantity !== undefined) updateData.maxQuantity = maxQuantity

    const providerService = await ProviderService.findByIdAndUpdate(id, updateData, { new: true })
      .populate("providerId", "name")
      .populate("serviceId", "name")
      .lean()

    if (!providerService) {
      return NextResponse.json(
        { success: false, error: "Provider service not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: providerService,
    })
  } catch (error) {
    console.error("Provider service update error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
