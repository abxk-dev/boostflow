"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Zap,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  LinkIcon,
  Play,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  Lock,
  Unlock,
  Timer,
  ChevronUp,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"

type OrderStep = "platform" | "configure" | "ad" | "submitting" | "success" | "error"

interface UnlockData {
  currentLevel: number
  maxQuantity: number
  levels: Array<{
    level: number
    maxQuantity: number
    unlocked: boolean
    unlockAfterHours: number
  }>
  nextUnlockAt: string | null
  totalOrders: number
}

interface ServiceData {
  _id: string
  name: string
  description: string
  minQuantity: number
  maxQuantity: number
  platformId: {
    _id: string
    name: string
    slug: string
  }
}

const PLATFORM_CONFIG: Record<
  string,
  {
    gradient: string
    bgGradient: string
    label: string
    description: string
    placeholder: string
    urlPattern: RegExp
    features: string[]
    emoji: string
  }
> = {
  instagram: {
    gradient: "from-pink-500 via-purple-500 to-orange-400",
    bgGradient: "from-pink-500/20 via-purple-500/10 to-transparent",
    label: "Instagram Reels",
    description: "Boost your Reels with real views",
    placeholder: "https://instagram.com/reel/...",
    urlPattern: /instagram\.com\/(p|reel|stories|tv)\/[a-zA-Z0-9_-]+/,
    features: ["Real Views", "Instant Start", "Safe & Secure"],
    emoji: "📸",
  },
  tiktok: {
    gradient: "from-cyan-400 via-blue-500 to-purple-600",
    bgGradient: "from-cyan-400/20 via-blue-500/10 to-transparent",
    label: "TikTok Videos",
    description: "Get more views on your TikTok content",
    placeholder: "https://tiktok.com/@user/video/...",
    urlPattern: /tiktok\.com\/@[\w.-]+\/video\/\d+/,
    features: ["Viral Boost", "Real Engagement", "Fast Delivery"],
    emoji: "🎵",
  },
}

export function OrderForm() {
  const [step, setStep] = useState<OrderStep>("platform")
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [service, setService] = useState<ServiceData | null>(null)
  const [targetUrl, setTargetUrl] = useState("")
  const [quantity, setQuantity] = useState(100)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [unlockData, setUnlockData] = useState<UnlockData | null>(null)
  const [unlockLoading, setUnlockLoading] = useState(false)
  const [adWatching, setAdWatching] = useState(false)
  const [adCompleted, setAdCompleted] = useState(false)
  const [verificationId, setVerificationId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [trackingId, setTrackingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<string | null>(null)
  const [cooldownInfo, setCooldownInfo] = useState<{
    locked: boolean
    cooldownType: string | null
    expiresAt: string | null
    remainingMs: number
    account: { id: string; locked: boolean; expiresAt: string | null }
  } | null>(null)
  const [cooldownCountdown, setCooldownCountdown] = useState<string | null>(null)
  const [checkingCooldown, setCheckingCooldown] = useState(false)

  // Fetch unlock status when platform is selected
  const fetchUnlockStatus = useCallback(async (platform: string) => {
    setUnlockLoading(true)
    try {
      const res = await fetch(`/api/unlock/status?platform=${platform}`)
      const data = await res.json()
      if (data.success) {
        setUnlockData(data.data)
        setQuantity(Math.min(100, data.data.maxQuantity))
      }
    } catch (err) {
      console.error("Failed to fetch unlock status:", err)
    } finally {
      setUnlockLoading(false)
    }
  }, [])

  // Fetch service for platform
  const fetchService = useCallback(async (platformSlug: string) => {
    try {
      const res = await fetch("/api/services")
      const data = await res.json()
      if (data.success) {
        const found = data.data.find(
          (s: ServiceData) =>
            s.platformId?.slug === platformSlug &&
            s.name.toLowerCase().includes("views")
        )
        if (found) setService(found)
      }
    } catch (err) {
      console.error("Failed to fetch service:", err)
    }
  }, [])

  // Check cooldown for a URL
  const checkCooldown = useCallback(async (url: string, platform: string, svcId: string) => {
    setCheckingCooldown(true)
    try {
      const res = await fetch("/api/cooldown/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, platform, serviceId: svcId }),
      })
      const data = await res.json()
      if (data.success) {
        setCooldownInfo(data.data)
        return data.data.locked
      }
    } catch (err) {
      console.error("Cooldown check failed:", err)
    } finally {
      setCheckingCooldown(false)
    }
    return false
  }, [])

  // Countdown timer for next unlock
  useEffect(() => {
    if (!unlockData?.nextUnlockAt) {
      setCountdown(null)
      return
    }

    const updateCountdown = () => {
      const now = new Date().getTime()
      const target = new Date(unlockData.nextUnlockAt!).getTime()
      const diff = target - now

      if (diff <= 0) {
        setCountdown("Ready to unlock!")
        if (selectedPlatform) fetchUnlockStatus(selectedPlatform)
        return
      }

      const hours = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setCountdown(`${hours}h ${mins}m ${secs}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [unlockData?.nextUnlockAt, selectedPlatform, fetchUnlockStatus])

  // Countdown timer for cooldown
  useEffect(() => {
    if (!cooldownInfo?.locked || !cooldownInfo?.expiresAt) {
      setCooldownCountdown(null)
      return
    }

    const updateCooldown = () => {
      const now = new Date().getTime()
      const target = new Date(cooldownInfo.expiresAt!).getTime()
      const diff = target - now

      if (diff <= 0) {
        setCooldownCountdown(null)
        setCooldownInfo(null)
        return
      }

      const hours = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setCooldownCountdown(`${hours}h ${mins}m ${secs}s`)
    }

    updateCooldown()
    const interval = setInterval(updateCooldown, 1000)
    return () => clearInterval(interval)
  }, [cooldownInfo?.locked, cooldownInfo?.expiresAt])

  const handlePlatformSelect = async (platform: string) => {
    setSelectedPlatform(platform)
    setTargetUrl("")
    setUrlError(null)
    setAdCompleted(false)
    setVerificationId(null)
    setError(null)
    await Promise.all([fetchUnlockStatus(platform), fetchService(platform)])
    setStep("configure")
  }

  const validateUrl = (url: string): boolean => {
    if (!selectedPlatform) return false
    const config = PLATFORM_CONFIG[selectedPlatform]
    if (!config) return false
    if (!url) {
      setUrlError("Please enter a URL")
      return false
    }
    if (!config.urlPattern.test(url)) {
      setUrlError(`Please enter a valid ${config.label} URL`)
      return false
    }
    setUrlError(null)
    return true
  }

  // Debounced cooldown check when URL changes
  useEffect(() => {
    if (!targetUrl || !selectedPlatform || !service) {
      setCooldownInfo(null)
      return
    }

    const config = PLATFORM_CONFIG[selectedPlatform]
    if (!config || !config.urlPattern.test(targetUrl)) {
      setCooldownInfo(null)
      return
    }

    const timer = setTimeout(() => {
      checkCooldown(targetUrl, selectedPlatform, service._id)
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
  }, [targetUrl, selectedPlatform, service, checkCooldown])

  const handleContinueToAd = () => {
    if (!targetUrl || !validateUrl(targetUrl)) return
    if (!unlockData) return
    if (quantity > unlockData.maxQuantity) {
      setError(`Maximum quantity for your level is ${unlockData.maxQuantity}`)
      return
    }
    setError(null)
    setStep("ad")
  }

  const handleWatchAd = async () => {
    if (!selectedPlatform) return
    setAdWatching(true)
    setError(null)

    try {
      // Trigger Adexium rewarded ad if available
      const adToken = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Ad timed out. Please try again."))
        }, 60000)

        // Check for Adexium widget reward callback
        const w = window as any
        if (w.AdexiumWidget && w.__adexiumInstance) {
          // Adexium autoMode handles the ad — listen for reward
          w.__adexiumReward = (token: string) => {
            clearTimeout(timeout)
            resolve(token || `adex-${Date.now()}`)
          }
          // Trigger a new ad impression
          w.__adexiumInstance.showAd?.() || w.__adexiumInstance.triggerAd?.()
        } else {
          // Fallback: simulate ad completion for development
          clearTimeout(timeout)
          setTimeout(() => {
            resolve(`adex-${Date.now()}-${Math.random().toString(36).slice(2)}`)
          }, 2000)
        }
      })

      // Call backend to verify ad completion
      const res = await fetch("/api/ad/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedPlatform,
          adNetworkToken: adToken,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setVerificationId(data.data.verificationId)
        setAdCompleted(true)
        toast({
          title: "Ad Completed",
          description: "Submit button unlocked!",
        })
      } else {
        setError(data.error || "Ad verification failed")
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify ad completion")
    } finally {
      setAdWatching(false)
    }
  }

  const handleSubmitOrder = async () => {
    if (!service || !verificationId || !selectedPlatform) return
    setIsSubmitting(true)
    setError(null)

    try {
      const requestId = uuidv4()

      const res = await fetch("/api/orders/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          verificationId,
          serviceId: service._id,
          targetUrl,
          quantity,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setTrackingId(data.data.trackingId)
        setStep("success")
        fetchUnlockStatus(selectedPlatform)
      } else {
        setError(data.error || "Order failed")
        if (data.maxQuantity) {
          setUnlockData((prev) =>
            prev ? { ...prev, maxQuantity: data.maxQuantity, currentLevel: data.currentLevel } : prev
          )
        }
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep("platform")
    setSelectedPlatform(null)
    setService(null)
    setTargetUrl("")
    setQuantity(100)
    setUrlError(null)
    setUnlockData(null)
    setAdCompleted(false)
    setVerificationId(null)
    setTrackingId(null)
    setError(null)
  }

  const goBack = () => {
    if (step === "configure") {
      setStep("platform")
      setSelectedPlatform(null)
      setService(null)
      setUnlockData(null)
    } else if (step === "ad") {
      setStep("configure")
      setAdCompleted(false)
      setVerificationId(null)
    }
  }

  // Step indicator
  function StepIndicator() {
    const steps = [
      { key: "platform", label: "Platform" },
      { key: "configure", label: "Configure" },
      { key: "ad", label: "Verify" },
    ]
    const currentIndex =
      step === "platform" ? 0 : step === "configure" ? 1 : 2

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                i <= currentIndex
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "bg-white/5 text-white/40 border border-white/10"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  i < currentIndex
                    ? "bg-emerald-500 text-white"
                    : i === currentIndex
                    ? "bg-violet-500/30 text-violet-400"
                    : "bg-white/10 text-white/40"
                }`}
              >
                {i < currentIndex ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 ${
                  i < currentIndex ? "bg-emerald-500/50" : "bg-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  // Unlock progress display
  function UnlockProgress() {
    if (!unlockData) return null

    return (
      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-white">
              Quantity Level {unlockData.currentLevel}
            </span>
          </div>
          <span className="text-xs text-violet-400">
            {unlockData.totalOrders} orders completed
          </span>
        </div>

        {/* Level progress bar */}
        <div className="flex items-center gap-2 mb-2">
          {unlockData.levels.map((level, i) => (
            <div key={level.level} className="flex-1 flex items-center gap-1">
              <div
                className={`h-2 flex-1 rounded-full transition-all ${
                  level.unlocked
                    ? "bg-gradient-to-r from-violet-500 to-cyan-500"
                    : "bg-white/10"
                }`}
              />
              {i < unlockData.levels.length - 1 && (
                <ChevronUp className="h-3 w-3 text-white/20 rotate-90" />
              )}
            </div>
          ))}
        </div>

        {/* Level labels */}
        <div className="flex justify-between text-[10px] text-white/40">
          {unlockData.levels.map((level) => (
            <span
              key={level.level}
              className={level.unlocked ? "text-violet-400 font-medium" : ""}
            >
              {level.maxQuantity}
            </span>
          ))}
        </div>

        {/* Next unlock timer */}
        {countdown && unlockData.currentLevel < 3 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-cyan-400">
            <Timer className="h-3 w-3" />
            <span>Next level in: {countdown}</span>
          </div>
        )}

        {unlockData.currentLevel >= 3 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            <span>Maximum level reached!</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
          <Zap className="h-3.5 w-3.5" />
          <span>Start Your Boost</span>
        </div>
        <p className="text-sm text-gray-400">
          No account needed — choose your platform, paste your link, and get real views
        </p>
      </div>

      <StepIndicator />

      {/* Step 1: Choose Platform */}
      {step === "platform" && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Choose Your Platform</h3>
            <p className="text-sm text-gray-400">Select the platform you want to boost</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(PLATFORM_CONFIG).map(([slug, config]) => (
              <button
                key={slug}
                onClick={() => handlePlatformSelect(slug)}
                className="relative group p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-left"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative flex items-start gap-4">
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg text-2xl`}>
                    {config.emoji}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">{config.label}</h4>
                    <p className="text-sm text-gray-400 mb-3">{config.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {config.features.map((f) => (
                        <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/30 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === "configure" && selectedPlatform && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={goBack} className="text-white/60 hover:text-white p-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h3 className="text-lg font-semibold text-white">Configure Your Boost</h3>
              <p className="text-sm text-gray-400">Paste your link and choose quantity</p>
            </div>
          </div>

          {/* Platform summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-white/5 to-transparent border border-white/10">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${PLATFORM_CONFIG[selectedPlatform]?.gradient} flex items-center justify-center shadow-lg text-xl`}>
                {PLATFORM_CONFIG[selectedPlatform]?.emoji}
              </div>
              <div>
                <span className="font-semibold text-white text-lg">
                  {PLATFORM_CONFIG[selectedPlatform]?.label}
                </span>
                {service && (
                  <p className="text-sm text-gray-400">{service.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Unlock Progress */}
          {unlockLoading ? (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
              <span className="text-sm text-gray-400">Loading unlock status...</span>
            </div>
          ) : (
            <UnlockProgress />
          )}

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="targetUrl" className="text-white/80 flex items-center gap-2 text-sm font-medium">
              <LinkIcon className="h-4 w-4 text-violet-400" />
              {PLATFORM_CONFIG[selectedPlatform]?.label} URL
            </Label>
            <div className="relative">
              <Input
                id="targetUrl"
                type="url"
                placeholder={PLATFORM_CONFIG[selectedPlatform]?.placeholder}
                value={targetUrl}
                onChange={(e) => {
                  setTargetUrl(e.target.value)
                  if (e.target.value) validateUrl(e.target.value)
                  else setUrlError(null)
                }}
                className={`h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl text-base focus:border-violet-500/50 focus:ring-violet-500/20 ${urlError ? "border-red-500/50" : ""}`}
              />
              {targetUrl && !urlError && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
              )}
            </div>
            {urlError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {urlError}
              </p>
            )}

            {/* Cooldown warning */}
            {checkingCooldown && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Checking availability...</span>
              </div>
            )}
            {cooldownInfo?.locked && cooldownCountdown && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Timer className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-400">
                    {cooldownInfo.cooldownType === "account"
                      ? "Account Cooldown Active"
                      : "Link Cooldown Active"}
                  </span>
                </div>
                <p className="text-xs text-amber-300/80 mb-2">
                  {cooldownInfo.cooldownType === "account"
                    ? "You have already boosted this account. You can place another order after 3 hours."
                    : "You have already boosted this link. You can order again after 3 hours."}
                </p>
                <div className="flex items-center gap-2 text-sm font-mono text-amber-400">
                  <Clock className="h-3 w-3" />
                  <span>Next order available in: {cooldownCountdown}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/80 text-sm font-medium">Quantity</Label>
              {unlockData && (
                <span className="text-xs text-violet-400">
                  Max: {unlockData.maxQuantity} (Level {unlockData.currentLevel})
                </span>
              )}
            </div>
            <Input
              type="number"
              min={service?.minQuantity || 100}
              max={unlockData?.maxQuantity || 300}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="h-12 bg-white/5 border-white/10 text-white rounded-xl text-base focus:border-violet-500/50 focus:ring-violet-500/20"
            />
            {unlockData && (
              <div className="grid grid-cols-4 gap-2">
                {[100, 200, 300, 500].map((preset) => {
                  const locked = preset > unlockData.maxQuantity
                  return (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => !locked && setQuantity(preset)}
                      disabled={locked}
                      className={`h-10 rounded-xl text-sm font-medium transition-all ${
                        quantity === preset
                          ? "bg-violet-500/20 border-violet-500/30 text-violet-400"
                          : locked
                          ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {locked ? <Lock className="h-3 w-3 mr-1" /> : null}
                      {preset}
                    </Button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Shield, text: "100% Safe", color: "text-emerald-400" },
              { icon: Clock, text: "Instant Start", color: "text-cyan-400" },
              { icon: TrendingUp, text: "Real Views", color: "text-violet-400" },
            ].map((badge) => (
              <div key={badge.text} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-white/60">
                <badge.icon className={`h-3 w-3 ${badge.color}`} />
                {badge.text}
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Continue Button */}
          <Button
            className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleContinueToAd}
            disabled={!targetUrl || !unlockData || quantity < (service?.minQuantity || 100) || cooldownInfo?.locked || checkingCooldown}
          >
            {cooldownInfo?.locked ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Cooldown Active
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Continue to Verify
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Step 3: Watch Ad */}
      {step === "ad" && selectedPlatform && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={goBack} className="text-white/60 hover:text-white p-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Quick Verification</h3>
              <p className="text-sm text-gray-400">Watch a short ad to unlock your boost</p>
            </div>
          </div>

          {/* Order summary */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Platform</span>
              <span className="text-white font-medium">{PLATFORM_CONFIG[selectedPlatform]?.label}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-400">Quantity</span>
              <span className="text-white font-medium">{quantity.toLocaleString()} views</span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 text-center">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
              adCompleted
                ? "bg-emerald-500/20"
                : "bg-gradient-to-br from-violet-500 to-cyan-500 shadow-violet-500/30"
            }`}>
              {adCompleted ? (
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              ) : (
                <Play className="h-8 w-8 text-white" />
              )}
            </div>

            <h3 className="text-xl font-bold mb-2 text-white">
              {adCompleted ? "Ad Completed!" : "Watch to Unlock"}
            </h3>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              {adCompleted
                ? "Your Submit button is now unlocked. You can place your order."
                : "Watch a short ad to unlock the Submit button. This keeps the service free."}
            </p>

            {!adCompleted ? (
              <div className="space-y-4">
                {/* Ad container */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex flex-col items-center gap-3">
                    {adWatching ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                        <p className="text-sm text-white/60">Loading ad...</p>
                        <p className="text-xs text-white/30">Please wait while the ad loads. Do not close this page.</p>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                          <Play className="h-6 w-6 text-violet-400" />
                        </div>
                        <p className="text-xs text-white/40">
                          Powered by rewarded ad network
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  className="h-12 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleWatchAd}
                  disabled={adWatching}
                >
                  {adWatching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Watch Ad
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <Unlock className="h-5 w-5" />
                  <span className="text-sm font-medium">Submit Order is now unlocked</span>
                </div>

                <Button
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Submit Order
                    </>
                  )}
                </Button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submitting */}
      {step === "submitting" && (
        <div className="text-center py-16">
          <div className="relative mb-8">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto animate-pulse shadow-lg shadow-violet-500/30">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <Loader2 className="absolute -bottom-1 -right-1 h-6 w-6 animate-spin text-violet-400" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">Submitting Your Order</h3>
          <p className="text-gray-400">Please wait while we process your boost...</p>
        </div>
      )}

      {/* Success */}
      {step === "success" && (
        <div className="text-center py-8">
          <div className="relative mb-8">
            <div className="h-20 w-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-2 text-white">Boost Started!</h3>
          <p className="text-gray-400 mb-8">Your content is being boosted. Save your tracking ID.</p>

          {trackingId && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-violet-500/20">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-medium">Your Tracking ID</p>
              <code className="text-2xl font-mono text-violet-400 font-bold tracking-wider">{trackingId}</code>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={resetForm} className="h-11 px-6 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10">
              Place Another Order
            </Button>
            {trackingId && (
              <Button asChild className="h-11 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold">
                <a href={`/track?id=${trackingId}`}>Track Your Order</a>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {step === "error" && (
        <div className="text-center py-8">
          <div className="h-16 w-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">Something Went Wrong</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={resetForm} className="h-11 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold">
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
