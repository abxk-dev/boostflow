import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { connectDB } from "@/lib/db"
import { Provider } from "@/lib/models"
import { providerCreateSchema } from "@/lib/validations"
import { encrypt } from "@/lib/crypto"
import { ZodError } from "zod"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    await connectDB()

    const providers = await Provider.find()
      .sort({ priority: -1, name: 1 })
      .lean()

    // Mask API keys in response
    const maskedProviders = providers.map((p) => ({
      ...p,
      apiKey: p.apiKey ? "••••••••" : "",
      apiSecret: p.apiSecret ? "••••••••" : "",
    }))

    return NextResponse.json({
      success: true,
      data: maskedProviders,
    })
  } catch (error) {
    console.error("Admin providers fetch error:", error)
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
    const validatedData = providerCreateSchema.parse(body)

    await connectDB()

    // Encrypt API credentials
    const provider = await Provider.create({
      ...validatedData,
      apiKey: encrypt(validatedData.apiKey),
      apiSecret: validatedData.apiSecret ? encrypt(validatedData.apiSecret) : undefined,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...provider.toObject(),
        apiKey: "••••••••",
        apiSecret: provider.apiSecret ? "••••••••" : undefined,
      },
    }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues?.[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || "Validation error" },
        { status: 400 }
      )
    }

    console.error("Admin provider create error:", error)
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
    const { id, apiKey, apiSecret, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Provider ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

    // Encrypt new credentials if provided
    if (apiKey) {
      updateData.apiKey = encrypt(apiKey)
    }
    if (apiSecret) {
      updateData.apiSecret = encrypt(apiSecret)
    }

    const provider = await Provider.findByIdAndUpdate(id, updateData, { new: true }).lean()

    if (!provider) {
      return NextResponse.json(
        { success: false, error: "Provider not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...provider,
        apiKey: provider.apiKey ? "••••••••" : "",
        apiSecret: provider.apiSecret ? "••••••••" : "",
      },
    })
  } catch (error) {
    console.error("Admin provider update error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
