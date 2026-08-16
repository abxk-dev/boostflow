import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const ADMIN_SECRET = process.env.ADMIN_SECRET || "boostflow-admin-secret-2026"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { step, pin } = body

    if (step === "pin") {
      const adminPin = process.env.ADMIN_PIN || "4588"

      if (pin === adminPin) {
        return NextResponse.json({ success: true, message: "PIN verified" })
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid PIN" },
          { status: 401 }
        )
      }
    }

    if (step === "complete") {
      // Use NextResponse.cookies.set() — cookies() is read-only in Next.js 15+
      const response = NextResponse.json({ success: true, message: "Session created" })
      response.cookies.set("admin_session", ADMIN_SECRET, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400,
        path: "/",
      })
      return response
    }

    return NextResponse.json(
      { success: false, error: "Invalid step" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Admin auth error:", error)
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")

    if (session?.value === ADMIN_SECRET) {
      return NextResponse.json({ success: true, authenticated: true })
    }

    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 401 }
    )
  } catch (error) {
    console.error("Admin session check error:", error)
    return NextResponse.json(
      { success: false, error: "Session check failed" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Use NextResponse.cookies.delete() — cookies() is read-only in Next.js 15+
    const response = NextResponse.json({ success: true, message: "Logged out" })
    response.cookies.delete("admin_session")
    return response
  } catch (error) {
    console.error("Admin logout error:", error)
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    )
  }
}
