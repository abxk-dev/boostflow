import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { connectDB } from "@/lib/db"
import { Platform } from "@/lib/models"
import { platformCreateSchema } from "@/lib/validations"
import { ZodError } from "zod"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    await connectDB()

    const platforms = await Platform.find()
      .sort({ sortOrder: 1, name: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: platforms,
    })
  } catch (error) {
    console.error("Admin platforms fetch error:", error)
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
    const validatedData = platformCreateSchema.parse(body)

    await connectDB()

    const platform = await Platform.create(validatedData)

    return NextResponse.json({
      success: true,
      data: platform,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues?.[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || "Validation error" },
        { status: 400 }
      )
    }

    console.error("Admin platform create error:", error)
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
        { success: false, error: "Platform ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

    const platform = await Platform.findByIdAndUpdate(id, updateData, { new: true }).lean()

    if (!platform) {
      return NextResponse.json(
        { success: false, error: "Platform not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: platform,
    })
  } catch (error) {
    console.error("Admin platform update error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
