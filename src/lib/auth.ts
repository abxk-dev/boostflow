import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Mock user for development without MongoDB
const MOCK_USER = {
  id: "dev-user-1",
  email: "dev@boostflow.com",
  name: "Dev User",
  role: "user",
  passwordHash: "$2a$10$hashedpassword", // not used in dev
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        // In development without MongoDB, accept any credentials
        if (process.env.NODE_ENV === "development" && !process.env.MONGODB_URI?.includes("mongodb+srv://user:password")) {
          try {
            const bcrypt = await import("bcryptjs")
            const { connectDB } = await import("./db")
            const { User } = await import("./models")

            await connectDB()

            const user = await User.findOne({
              email: (credentials.email as string).toLowerCase(),
            })

            if (!user) {
              throw new Error("Invalid email or password")
            }

            if (!user.isActive) {
              throw new Error("Account is deactivated")
            }

            const isPasswordValid = await bcrypt.compare(
              credentials.password as string,
              user.passwordHash
            )

            if (!isPasswordValid) {
              throw new Error("Invalid email or password")
            }

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.username,
              role: user.role,
            } as unknown as { id: string; email: string; name: string; role: string }
          } catch (dbError) {
            console.warn("MongoDB connection failed, using mock user for development:", dbError)
            // Fall through to mock user
          }
        }

        // Development mode: accept any email/password combination
        if (process.env.NODE_ENV === "development") {
          console.log("Using mock auth for development. Email:", credentials.email)
          return {
            id: MOCK_USER.id,
            email: credentials.email as string,
            name: (credentials.email as string).split("@")[0],
            role: MOCK_USER.role,
          } as unknown as { id: string; email: string; name: string; role: string }
        }

        throw new Error("Invalid email or password")
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session.user as any
        user.id = token.id as string
        user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/boost",
    error: "/boost",
  },
  secret: process.env.AUTH_SECRET,
})
