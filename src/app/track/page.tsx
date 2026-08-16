"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import {
  Search,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  ExternalLink,
  ArrowRight,
  Package,
  BarChart3,
  Globe,
  Eye,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

interface OrderStatus {
  _id: string
  trackingId: string
  status: string
  targetUrl: string
  quantity: number
  startedAt: string
  completedAt?: string
  serviceId: {
    name: string
    description: string
  }
  platformId: {
    name: string
    slug: string
  }
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  ORDER_QUEUED: { label: "Queued", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  PROVIDER_DISPATCHED: { label: "Dispatched", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Zap },
  PROCESSING: { label: "Processing", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Loader2 },
  IN_PROGRESS: { label: "In Progress", color: "bg-violet-500/20 text-violet-400 border-violet-500/30", icon: Zap },
  DELIVERED: { label: "Delivered", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  COMPLETED: { label: "Completed", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  FAILED: { label: "Failed", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertCircle },
  CANCELLED: { label: "Cancelled", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: AlertCircle },
}

export default function TrackPage() {
  const searchParams = useSearchParams()
  const [trackingId, setTrackingId] = useState(searchParams.get("id") || "")
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      setTrackingId(id)
      handleSearch(id)
    }
  }, [searchParams])

  const handleSearch = async (id?: string) => {
    const searchId = id || trackingId
    if (!searchId.trim()) return

    setIsLoading(true)
    setError(null)
    setSearched(true)

    try {
      const response = await fetch(`/api/orders/track?trackingId=${encodeURIComponent(searchId.trim())}`)
      const data = await response.json()

      if (data.success) {
        setOrder(data.data)
      } else {
        setError(data.error || "Order not found")
        setOrder(null)
      }
    } catch {
      setError("Failed to fetch order status")
      setOrder(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.ORDER_QUEUED
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0F]">
      <Header />

      <main className="flex-1 pt-32 pb-16 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-pink-500/5 blur-[80px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="max-w-2xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6">
                <Package className="h-3.5 w-3.5" />
                <span className="tracking-wide">Order Tracking</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight">
                Track Your <span className="gradient-text-animated">Boost</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
                Enter your tracking ID to see real-time delivery progress
              </p>
            </div>

            {/* Search Form */}
            <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-6 md:p-8 mb-8">
              {/* Glow effect */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-violet-600/20 blur-[80px] pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    id="trackingId"
                    placeholder="BF-A1B2C3D4"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl text-base focus:border-violet-500/50 focus:ring-violet-500/20"
                  />
                </div>
                <Button
                  onClick={() => handleSearch()}
                  disabled={isLoading || !trackingId.trim()}
                  className="h-12 px-8 cta-gradient text-black font-semibold rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Track
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Results */}
            {isLoading && (
              <div className="text-center py-16">
                <div className="relative mx-auto w-16 h-16 mb-6">
                  <div className="absolute inset-0 rounded-full bg-violet-600/20 animate-ping" />
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                </div>
                <p className="text-white/60 text-lg">Searching for your order...</p>
                <p className="text-white/30 text-sm mt-2">This won&apos;t take long</p>
              </div>
            )}

            {error && searched && !isLoading && (
              <div className="relative rounded-2xl overflow-hidden border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Order Not Found</h3>
                <p className="text-white/60 mb-6 max-w-sm mx-auto">{error}</p>
                <p className="text-sm text-white/40">
                  Please check your tracking ID and try again. Tracking IDs are case-sensitive.
                </p>
              </div>
            )}

            {order && !isLoading && (
              <div className="space-y-6">
                {/* Status Card */}
                <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">Order Status</h2>
                      <p className="text-sm text-white/40">
                        Tracking ID: <span className="text-[#00E5FF] font-mono">{order.trackingId}</span>
                      </p>
                    </div>
                    <Badge className={`${getStatusConfig(order.status).color} text-sm px-4 py-1.5 border`}>
                      {getStatusConfig(order.status).label}
                    </Badge>
                  </div>

                  {/* Status Progress */}
                  <div className="relative">
                    {/* Progress line */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10 rounded-full" />
                    <div
                      className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-1000"
                      style={{
                        width: `${
                          order.status === "ORDER_QUEUED" ? "0%" :
                          order.status === "PROVIDER_DISPATCHED" ? "25%" :
                          order.status === "PROCESSING" ? "50%" :
                          order.status === "IN_PROGRESS" ? "75%" :
                          "100%"
                        }`,
                      }}
                    />

                    <div className="relative flex items-start justify-between">
                      {["ORDER_QUEUED", "PROVIDER_DISPATCHED", "IN_PROGRESS", "COMPLETED"].map((status, i) => {
                        const config = getStatusConfig(status)
                        const isActive = order.status === status
                        const isPast = ["ORDER_QUEUED", "PROVIDER_DISPATCHED", "IN_PROGRESS", "COMPLETED"].indexOf(order.status) > i

                        return (
                          <div key={status} className="flex flex-col items-center" style={{ width: "25%" }}>
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                                isActive
                                  ? "cta-gradient shadow-lg shadow-violet-500/30 scale-110"
                                  : isPast
                                  ? "bg-emerald-500/20 border border-emerald-500/30"
                                  : "bg-white/5 border border-white/10"
                              }`}
                            >
                              {isPast ? (
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <config.icon
                                  className={`h-5 w-5 ${
                                    isActive ? "text-black" : "text-white/40"
                                  } ${isActive && status === "PROCESSING" ? "animate-spin" : ""}`}
                                />
                              )}
                            </div>
                            <span
                              className={`text-xs mt-3 text-center font-medium ${
                                isActive ? "text-white" : isPast ? "text-emerald-400" : "text-white/40"
                              }`}
                            >
                              {config.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-6 md:p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-violet-400" />
                    Order Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 text-white/40 text-sm mb-1">
                        <Globe className="h-3.5 w-3.5" />
                        Platform
                      </div>
                      <div className="text-white font-medium">{order.platformId?.name}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 text-white/40 text-sm mb-1">
                        <Eye className="h-3.5 w-3.5" />
                        Service
                      </div>
                      <div className="text-white font-medium">{order.serviceId?.name}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 text-white/40 text-sm mb-1">
                        <Zap className="h-3.5 w-3.5" />
                        Quantity
                      </div>
                      <div className="text-white font-medium">{order.quantity.toLocaleString()}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 text-white/40 text-sm mb-1">
                        <Clock className="h-3.5 w-3.5" />
                        Started
                      </div>
                      <div className="text-white font-medium text-sm">
                        {new Date(order.startedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Target URL */}
                  <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-white/40 text-sm mb-1">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Target URL
                        </div>
                        <a
                          href={order.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00E5FF] hover:underline text-sm font-mono"
                        >
                          {order.targetUrl.length > 50
                            ? order.targetUrl.substring(0, 50) + "..."
                            : order.targetUrl}
                        </a>
                      </div>
                      <a
                        href={order.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {order.completedAt && (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Completed
                      </div>
                      <div className="text-white font-medium text-sm">
                        {new Date(order.completedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleSearch()}
                    className="flex-1 h-12 glass-chip border-white/10 text-white hover:bg-white/10 rounded-xl"
                  >
                    <Loader2 className="mr-2 h-4 w-4" />
                    Refresh Status
                  </Button>
                  <Button asChild className="flex-1 h-12 cta-gradient text-black font-semibold rounded-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all">
                    <Link href="/">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Place New Order
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Help text */}
            {!searched && (
              <div className="text-center mt-12">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/5">
                  <p className="text-sm text-white/40">
                    Don&apos;t have a tracking ID?{" "}
                    <Link href="/" className="text-[#00E5FF] hover:underline font-medium">
                      Place a new order
                    </Link>{" "}
                    to get one.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
