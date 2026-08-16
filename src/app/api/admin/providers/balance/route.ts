import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { connectDB } from "@/lib/db"
import { Provider } from "@/lib/models"
import { decrypt } from "@/lib/crypto"
import { SMMPanel } from "@/lib/smm-panel"

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { providerId } = body

    if (!providerId) {
      return NextResponse.json(
        { success: false, error: "Provider ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

    const provider = await Provider.findById(providerId).lean()
    if (!provider) {
      return NextResponse.json(
        { success: false, error: "Provider not found" },
        { status: 404 }
      )
    }

    // Decrypt the API key
    let apiKey: string
    try {
      apiKey = decrypt(provider.apiKey)
    } catch {
      // If decryption fails, the key might be stored unencrypted or from a different ENCRYPTION_KEY
      apiKey = provider.apiKey
    }

    if (!apiKey || apiKey === "REPLACE_WITH_YOUR_KEY") {
      return NextResponse.json(
        { success: false, error: "API key not configured. Edit this provider and enter your API key." },
        { status: 400 }
      )
    }

    // Create SMM Panel instance and fetch balance
    const panel = new SMMPanel({
      apiUrl: provider.apiUrl,
      apiKey,
    })

    const balanceData = await panel.getBalance()

    return NextResponse.json({
      success: true,
      data: {
        balance: balanceData.balance,
        currency: balanceData.currency || "USD",
        providerName: provider.name,
      },
    })
  } catch (error: any) {
    console.error("Provider balance fetch error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch balance" },
      { status: 500 }
    )
  }
}
