import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models"
import { registerSchema } from "@/lib/validations"
import { getClientIp, sanitizeString } from "@/lib/utils"
import { checkRateLimit } from "@/lib/rate-limit"
import { ZodError } from "zod"

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)

    // Rate limit registration attempts
    const rateLimit = await checkRateLimit(`register:${ip}`, "register", {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    await connectDB()

    // Check if email already exists
    const existingEmail = await User.findOne({ email: validatedData.email.toLowerCase() })
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      )
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: validatedData.username })
    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: "Username already taken" },
        { status: 409 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(validatedData.password, salt)

    // Create user
    const user = await User.create({
      email: validatedData.email.toLowerCase(),
      username: sanitizeString(validatedData.username),
      passwordHash,
      ipHistory: [ip],
    })

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues?.[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || "Validation error" },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
