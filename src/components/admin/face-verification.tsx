"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  Camera,
  CameraOff,
  ScanFace,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  Monitor,
} from "lucide-react"

type VerificationState =
  | "requesting-camera"
  | "camera-denied"
  | "demo-mode"
  | "detecting"
  | "scanning"
  | "success"
  | "failed"

interface FaceVerificationProps {
  onSuccess: () => void
  onCancel: () => void
}

export function FaceVerification({ onSuccess, onCancel }: FaceVerificationProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanTimerRef = useRef<NodeJS.Timeout | null>(null)
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [state, setState] = useState<VerificationState>("requesting-camera")
  const [progress, setProgress] = useState(0)
  const [faceDetected, setFaceDetected] = useState(false)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current)
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  // Request camera on mount
  useEffect(() => {
    startCamera()
  }, [])

  const startCamera = async () => {
    setState("requesting-camera")
    try {
      // Check if mediaDevices is available (requires HTTPS or localhost)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setState("camera-denied")
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Camera ready, start face detection simulation
      setState("detecting")

      // Simulate face detection after 1.5s
      setTimeout(() => {
        setFaceDetected(true)
        setState("scanning")
        startScanProgress()
      }, 1500)
    } catch (err: any) {
      setState("camera-denied")
    }
  }

  const startDemoScan = () => {
    setState("demo-mode")
    setProgress(0)
    setFaceDetected(false)

    // Start detecting phase
    setTimeout(() => {
      setFaceDetected(true)
      setState("scanning")
      startScanProgress()
    }, 1500)
  }

  const startScanProgress = () => {
    let currentProgress = 0
    const totalDuration = 3000 // 3 seconds scanning
    const interval = 50
    const increment = (interval / totalDuration) * 100

    progressTimerRef.current = setInterval(() => {
      currentProgress += increment
      if (currentProgress >= 100) {
        currentProgress = 100
        if (progressTimerRef.current) clearInterval(progressTimerRef.current)

        // Scanning complete — verify success
        setState("success")
        stopCamera()

        // Auto-redirect after 1.5s
        scanTimerRef.current = setTimeout(() => {
          onSuccess()
        }, 1500)
      }
      setProgress(currentProgress)
    }, interval)
  }

  const handleRetry = () => {
    setProgress(0)
    setFaceDetected(false)
    startCamera()
  }

  const isDemoMode = state === "demo-mode"
  const showCamera = state !== "camera-denied" && state !== "demo-mode"

  const stateConfig = {
    "requesting-camera": {
      title: "Requesting Camera Access",
      subtitle: "Please allow camera access to continue",
      icon: Camera,
      color: "text-[#00E5FF]",
    },
    "camera-denied": {
      title: "Camera Access Unavailable",
      subtitle: "HTTPS or localhost is required for camera access",
      icon: CameraOff,
      color: "text-red-400",
    },
    "demo-mode": {
      title: "Demo Face Scan",
      subtitle: "Simulated verification in progress",
      icon: Monitor,
      color: "text-purple-400",
    },
    detecting: {
      title: "Detecting Face",
      subtitle: "Position your face within the frame",
      icon: ScanFace,
      color: "text-yellow-400",
    },
    scanning: {
      title: "Scanning Face",
      subtitle: isDemoMode ? "Demo scan in progress..." : "Hold still while we verify your identity",
      icon: ScanFace,
      color: "text-[#00E5FF]",
    },
    success: {
      title: "Verification Successful",
      subtitle: "Identity confirmed — redirecting...",
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    failed: {
      title: "Verification Failed",
      subtitle: "Unable to verify identity. Please try again.",
      icon: XCircle,
      color: "text-red-400",
    },
  }

  const config = stateConfig[state]
  const IconComponent = config.icon

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Demo Badge */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <ShieldAlert className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-xs font-medium text-yellow-400 uppercase tracking-wider">
              Demo Face Verification
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 text-center border-b border-white/5">
            <div
              className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors",
                state === "success"
                  ? "bg-emerald-500/10"
                  : state === "failed" || state === "camera-denied"
                  ? "bg-red-500/10"
                  : isDemoMode
                  ? "bg-purple-500/10"
                  : "bg-[#00E5FF]/10"
              )}
            >
              {state === "detecting" || state === "scanning" ? (
                <Loader2 className={cn("h-7 w-7 animate-spin", config.color)} />
              ) : (
                <IconComponent className={cn("h-7 w-7", config.color)} />
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{config.title}</h2>
            <p className="text-sm text-white/50 mt-1">{config.subtitle}</p>
          </div>

          {/* Camera / Demo Preview */}
          <div className="relative aspect-[4/3] bg-black/50">
            {/* Live Camera Video */}
            <video
              ref={videoRef}
              className={cn(
                "w-full h-full object-cover transition-opacity",
                !showCamera && "hidden"
              )}
              playsInline
              muted
              autoPlay
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Demo mode animated background */}
            {(isDemoMode || state === "success") && !showCamera && (
              <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D14] to-[#0A0A0F]">
                {/* Animated grid */}
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,229,255,0.3) 1px, transparent 0)`,
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Animated face silhouette */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <svg
                      viewBox="0 0 120 140"
                      className={cn(
                        "w-32 h-36 transition-all duration-1000",
                        faceDetected ? "opacity-60 scale-100" : "opacity-20 scale-90"
                      )}
                      fill="none"
                      stroke={faceDetected ? "#00E5FF" : "rgba(255,255,255,0.3)"}
                      strokeWidth="1.5"
                    >
                      {/* Face outline */}
                      <ellipse cx="60" cy="65" rx="38" ry="48" />
                      {/* Left eye */}
                      <ellipse cx="44" cy="55" rx="8" ry="5" />
                      {/* Right eye */}
                      <ellipse cx="76" cy="55" rx="8" ry="5" />
                      {/* Nose */}
                      <path d="M60 60 L55 72 L65 72" />
                      {/* Mouth */}
                      <path d="M48 82 Q60 90 72 82" />
                    </svg>

                    {/* Scanning overlay on silhouette */}
                    {faceDetected && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div
                          className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_20px_rgba(0,229,255,0.6)]"
                          style={{ animation: "scanLine 2s ease-in-out infinite" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Face detection overlay — works for both camera and demo */}
            {(state === "detecting" || state === "scanning") && (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Scanning frame */}
                <div
                  className={cn(
                    "relative w-48 h-48 md:w-56 md:h-56 transition-all duration-500",
                    faceDetected ? "scale-100" : "scale-95"
                  )}
                >
                  {/* Corner brackets */}
                  <div
                    className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg transition-colors duration-300"
                    style={{ borderColor: faceDetected ? "#00E5FF" : "rgba(255,255,255,0.4)" }}
                  />
                  <div
                    className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg transition-colors duration-300"
                    style={{ borderColor: faceDetected ? "#00E5FF" : "rgba(255,255,255,0.4)" }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg transition-colors duration-300"
                    style={{ borderColor: faceDetected ? "#00E5FF" : "rgba(255,255,255,0.4)" }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-lg transition-colors duration-300"
                    style={{ borderColor: faceDetected ? "#00E5FF" : "rgba(255,255,255,0.4)" }}
                  />

                  {/* Scanning line animation */}
                  {state === "scanning" && (
                    <div className="absolute inset-x-0 top-0 bottom-0 overflow-hidden rounded-lg">
                      <div
                        className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_15px_rgba(0,229,255,0.5)]"
                        style={{ animation: "scanLine 2s ease-in-out infinite" }}
                      />
                    </div>
                  )}

                  {/* Pulsing glow when face detected */}
                  {faceDetected && state === "scanning" && (
                    <div className="absolute inset-0 rounded-lg border-2 border-[#00E5FF]/30 animate-pulse" />
                  )}
                </div>
              </div>
            )}

            {/* Camera denied overlay */}
            {state === "camera-denied" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 px-6">
                <CameraOff className="h-12 w-12 text-white/30 mb-4" />
                <p className="text-sm text-white/60 text-center mb-2">
                  Camera requires HTTPS or localhost access.
                </p>
                <p className="text-xs text-white/40 text-center mb-6">
                  You can continue with a demo face scan instead.
                </p>
                <button
                  onClick={startDemoScan}
                  className="w-full py-3 rounded-xl cta-gradient text-black font-semibold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue with Demo Scan
                </button>
              </div>
            )}

            {/* Requesting camera overlay */}
            {state === "requesting-camera" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <Loader2 className="h-10 w-10 text-[#00E5FF] animate-spin mb-3" />
                <p className="text-sm text-white/60">Waiting for camera permission...</p>
              </div>
            )}

            {/* Success overlay */}
            {state === "success" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {(state === "scanning" || state === "success") && (
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">
                  {state === "success" ? "Complete" : isDemoMode ? "Demo Scanning..." : "Scanning..."}
                </span>
                <span className="text-xs text-white/50 font-mono">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-100",
                    state === "success"
                      ? "bg-emerald-400"
                      : isDemoMode
                      ? "bg-gradient-to-r from-purple-500 to-[#00E5FF]"
                      : "bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6]"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Status indicators */}
          <div className="p-6 space-y-3">
            {/* Detection status */}
            {state === "detecting" && (
              <div className="flex items-center gap-3 text-sm">
                <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
                <span className="text-white/60">
                  {isDemoMode ? "Initializing demo scan..." : "Looking for face in frame..."}
                </span>
              </div>
            )}

            {state === "scanning" && faceDetected && (
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse" />
                <span className="text-white/60">
                  {isDemoMode ? "Demo scan — analyzing simulated features..." : "Face detected — analyzing features..."}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {state === "camera-denied" && (
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
                >
                  Try Camera Again
                </button>
              )}

              {state === "failed" && (
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 rounded-xl cta-gradient text-black font-semibold hover:opacity-90 transition-all"
                >
                  Retry Verification
                </button>
              )}

              <button
                onClick={() => {
                  stopCamera()
                  onCancel()
                }}
                className={cn(
                  "py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm",
                  state === "camera-denied" || state === "failed"
                    ? "flex-1"
                    : "w-full"
                )}
              >
                Cancel & Logout
              </button>
            </div>
          </div>
        </div>

        {/* Info text */}
        <p className="text-center text-xs text-white/30 mt-4">
          This is a demo face verification for UI purposes.
          <br />
          No biometric data is collected or stored.
        </p>
      </div>

      {/* Scan line animation CSS */}
      <style jsx global>{`
        @keyframes scanLine {
          0%, 100% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
        }
      `}</style>
    </div>
  )
}
