"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { FaceVerification } from "@/components/admin/face-verification"
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Globe,
  Server,
  Link2,
  Gift,
  BarChart3,
  AlertTriangle,
  FileText,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Menu,
  X,
  Zap,
  LogOut,
} from "lucide-react"

const adminNav = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: Package },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Services", href: "/admin/services", icon: Layers },
  { name: "Platforms", href: "/admin/platforms", icon: Globe },
  { name: "Providers", href: "/admin/providers", icon: Server },
  { name: "Provider Services", href: "/admin/provider-services", icon: Link2 },
  { name: "Ad Rewards", href: "/admin/ad-rewards", icon: Gift },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Fraud Logs", href: "/admin/fraud-logs", icon: AlertTriangle },
  { name: "System Logs", href: "/admin/system-logs", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

const ADMIN_PASSCODE = "4588"

type AuthStep = "loading" | "pin" | "face" | "authenticated"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [authStep, setAuthStep] = useState<AuthStep>("loading")
  const [passcode, setPasscode] = useState("")
  const [showPasscode, setShowPasscode] = useState(false)
  const [error, setError] = useState("")
  const [isShaking, setIsShaking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check existing session on mount — PIN screen is NEVER shown during this check
  useEffect(() => {
    const step = sessionStorage.getItem("admin_auth_step") as AuthStep

    if (step === "authenticated" || step === "face") {
      // Validate server session still exists
      fetch("/api/admin/auth")
        .then((res) => {
          if (res.ok) {
            setAuthStep("authenticated")
          } else {
            sessionStorage.removeItem("admin_auth_step")
            setAuthStep("pin")
          }
        })
        .catch(() => {
          sessionStorage.removeItem("admin_auth_step")
          setAuthStep("pin")
        })
    } else {
      // No previous session — show PIN immediately
      setAuthStep("pin")
    }
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === ADMIN_PASSCODE) {
      setError("")
      try {
        const res = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: passcode, step: "pin" }),
        })
        const data = await res.json()
        if (data.success) {
          setAuthStep("face")
          sessionStorage.setItem("admin_auth_step", "face")
        } else {
          setError("Verification failed")
        }
      } catch {
        setError("Connection error")
      }
    } else {
      setError("Incorrect PIN")
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      setPasscode("")
    }
  }

  const handleFaceVerificationSuccess = async () => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "complete" }),
      })
      const data = await res.json()
      if (data.success) {
        setAuthStep("authenticated")
        sessionStorage.setItem("admin_auth_step", "authenticated")
      } else {
        setError("Session creation failed")
        setAuthStep("pin")
        sessionStorage.removeItem("admin_auth_step")
      }
    } catch {
      setError("Connection error")
      setAuthStep("pin")
      sessionStorage.removeItem("admin_auth_step")
    }
  }

  const handleFaceVerificationCancel = () => {
    setAuthStep("pin")
    sessionStorage.removeItem("admin_auth_step")
    setPasscode("")
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" })
    } catch {
      // Continue even if this fails
    }
    setAuthStep("pin")
    sessionStorage.removeItem("admin_auth_step")
    setPasscode("")
    setSidebarOpen(false)
  }

  // Loading state — shown while validating session on refresh
  if (authStep === "loading") {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-2xl cta-gradient flex items-center justify-center shadow-[0_0_40px_-8px_rgba(0,229,255,0.5)] animate-pulse">
            <Zap className="h-7 w-7 text-black" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] animate-pulse [animation-delay:150ms]" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    )
  }

  // Step 1: PIN entry
  if (authStep === "pin") {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-2xl cta-gradient flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_-8px_rgba(0,229,255,0.5)]">
              <Lock className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-white/60 mt-2">Step 1 of 2 — Enter security PIN</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#00E5FF] flex items-center justify-center">
                <span className="text-xs font-bold text-black">1</span>
              </div>
              <span className="text-xs font-medium text-[#00E5FF]">PIN</span>
            </div>
            <div className="w-12 h-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-white/40">2</span>
              </div>
              <span className="text-xs font-medium text-white/40">Face</span>
            </div>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPasscode ? "text" : "password"}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value)
                  setError("")
                }}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                className={cn(
                  "w-full px-4 py-4 rounded-xl glass-chip border text-white text-center text-2xl tracking-[0.5em] font-mono placeholder:text-white/30 placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 transition-all",
                  error ? "border-red-500/50" : "border-white/10",
                  isShaking && "animate-shake"
                )}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPasscode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              className="w-full py-4 rounded-xl cta-gradient text-black font-semibold text-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue to Face Verification
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">
              ← Back to BoostFlow
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Face verification
  if (authStep === "face") {
    return (
      <FaceVerification
        onSuccess={handleFaceVerificationSuccess}
        onCancel={handleFaceVerificationCancel}
      />
    )
  }

  // Authenticated admin layout
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0D0D14]/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Menu button + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg cta-gradient flex items-center justify-center">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <span className="gradient-text font-bold hidden sm:inline">BoostFlow</span>
            </Link>
            <span className="text-white/30 text-sm hidden sm:inline">/</span>
            <span className="text-white/60 text-sm font-medium hidden sm:inline">Admin</span>
          </div>

          {/* Right: Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 bottom-0 z-40 w-64 bg-[#0D0D14] border-r border-white/10 transition-transform duration-300 md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {adminNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="pt-16 md:pl-64 min-h-screen">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}
