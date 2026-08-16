import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { connectDB } from "@/lib/db"
import { Service } from "@/lib/models"
import { serviceCreateSchema } from "@/lib/validations"
import { ZodError } from "zod"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    await connectDB()

    const services = await Service.find()
      .populate("platformId", "name slug")
      .sort({ sortOrder: 1, name: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: services,
    })
  } catch (error) {
    console.error("Admin services fetch error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validatedData = serviceCreateSchema.parse(body)

    await connectDB()

    const service = await Service.create(validatedData)

    return NextResponse.json({
      success: true,
      data: service,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues?.[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || "Validation error" },
        { status: 400 }
      )
    }

    console.error("Admin service create error:", error)
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
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Service ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

    const service = await Service.findByIdAndUpdate(id, updateData, { new: true })
      .populate("platformId", "name slug")
      .lean()

    if (!service) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: service,
    })
  } catch (error) {
    console.error("Admin service update error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
