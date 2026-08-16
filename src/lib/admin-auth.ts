import { auth } from "./auth"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const ADMIN_SECRET = process.env.ADMIN_SECRET || "boostflow-admin-secret-2026"

export async function requireAdmin() {
  // First check for admin session cookie (from PIN/face verification)
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin_session")

    if (adminSession?.value === ADMIN_SECRET) {
      return {
        authorized: true,
        session: null,
        userId: "admin",
      }
    }
  } catch (e) {
    console.error("Cookie check error:", e)
  }

  // Fall back to NextAuth session
  try {
    const session = await auth()

    if (session?.user) {
      const role = (session.user as { role: string }).role

      if (role === "admin") {
        return {
          authorized: true,
          session,
          userId: (session.user as { id: string }).id,
        }
      }
    }
  } catch (e) {
    console.error("Auth check error:", e)
  }

  return {
    authorized: false,
    response: NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    ),
  }
}
