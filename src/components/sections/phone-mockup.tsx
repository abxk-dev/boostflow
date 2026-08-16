"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Heart, MessageCircle, Send, Eye, Music2, Bookmark } from "lucide-react"

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString())

// Social media style photos (portrait/lifestyle from Unsplash)
const REEL_PHOTOS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=750&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=750&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=750&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=750&fit=crop&crop=face",
]

// Captions for each photo
const CAPTIONS = [
  "Golden hour vibes ✨ Living my best life",
  "That glow up is real 💅✨",
  "Weekend mood 🌙 City lights & late nights",
  "Be your own kind of beautiful 💫",
]

// Username handles
const HANDLES = [
  "@sarah.styles",
  "@jess.vibes",
  "@mia.lifestyle",
  "@luna.model",
]

export function PhoneMockup() {
  const [views, setViews] = useState(48210)
  const [likes, setLikes] = useState(3921)
  const [comments, setComments] = useState(412)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  // Preload all images
  useEffect(() => {
    REEL_PHOTOS.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  // Auto-cycle photos every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % REEL_PHOTOS.length)
      setImageLoaded(false)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  // Live engagement counter
  useEffect(() => {
    const id = setInterval(() => {
      setViews((v) => v + Math.floor(Math.random() * 90) + 25)
      setLikes((l) => l + Math.floor(Math.random() * 9) + 2)
      if (Math.random() > 0.55) setComments((c) => c + 1)
    }, 900)
    return () => clearInterval(id)
  }, [])

  const currentPhoto = REEL_PHOTOS[photoIndex]
  const currentCaption = CAPTIONS[photoIndex]
  const currentHandle = HANDLES[photoIndex]

  return (
    <div
      className="relative w-[270px] sm:w-[300px] rounded-[2.6rem] border border-white/15 bg-[#0D0D14] p-2.5 shadow-[0_0_80px_-20px_rgba(139,92,246,0.55),0_30px_60px_-30px_rgba(0,0,0,0.8)]"
      data-testid="phone-mockup"
    >
      {/* notch */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20" />

      <div className="relative rounded-[2.1rem] overflow-hidden aspect-[9/17.5] bg-[#0a0a12]">
        {/* Photo slideshow */}
        {REEL_PHOTOS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: i === photoIndex ? 1 : 0 }}
            onLoad={() => {
              if (i === photoIndex) setImageLoaded(true)
            }}
          />
        ))}

        {/* Subtle color overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 z-[1]" />

        {/* Top bar — LIVE BOOST + views */}
        <div className="absolute top-9 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md border border-[#00E5FF]/30 px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
          <span className="text-[10px] font-semibold tracking-wider text-[#00E5FF]">LIVE BOOST</span>
        </div>

        <div className="absolute top-9 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1">
          <Eye size={12} className="text-white/80" />
          <span className="text-[11px] font-semibold tabular-nums" data-testid="counter-views">
            {views.toLocaleString()}
          </span>
        </div>

        {/* Right action rail */}
        <div className="absolute right-3 bottom-32 z-10 flex flex-col items-center gap-5">
          {/* Profile pic */}
          <div className="relative mb-1">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00E5FF]">
              <img
                src={currentPhoto}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FF2E9F] flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">+</span>
            </div>
          </div>

          {/* Like */}
          <button
            className="flex flex-col items-center gap-1"
            onClick={() => setLiked(!liked)}
          >
            <span className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
              <Heart
                size={20}
                className={liked ? "text-[#FF2E9F] fill-[#FF2E9F] scale-110 transition-transform" : "text-white transition-transform"}
              />
            </span>
            <span className="text-[11px] font-semibold tabular-nums" data-testid="counter-likes">
              {fmt(liked ? likes + 1 : likes)}
            </span>
          </button>

          {/* Comment */}
          <button className="flex flex-col items-center gap-1">
            <span className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
              <MessageCircle size={20} className="text-white" />
            </span>
            <span className="text-[11px] font-semibold tabular-nums" data-testid="counter-comments">{fmt(comments)}</span>
          </button>

          {/* Share */}
          <button className="flex flex-col items-center gap-1">
            <span className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
              <Send size={17} className="text-white" />
            </span>
            <span className="text-[11px] font-semibold">Share</span>
          </button>

          {/* Bookmark */}
          <button
            className="flex flex-col items-center gap-1"
            onClick={() => setSaved(!saved)}
          >
            <span className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
              <Bookmark
                size={18}
                className={saved ? "text-yellow-400 fill-yellow-400" : "text-white"}
              />
            </span>
          </button>

          {/* Audio disc */}
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 animate-spin-slow">
            <div className="w-full h-full cta-gradient" />
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-0 inset-x-0 z-10 p-4 pb-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          {/* Username row */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-white">{currentHandle}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#00E5FF]/40 text-[#00E5FF] font-medium">Boosting</span>
          </div>

          {/* Caption */}
          <p className="text-[12px] text-white/80 leading-snug mb-2 line-clamp-2">
            {currentCaption}
          </p>

          {/* Audio info */}
          <div className="flex items-center gap-1.5 text-white/50">
            <Music2 size={10} />
            <span className="text-[10px]">Original audio · trending</span>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1 mt-3">
            {REEL_PHOTOS.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 rounded-full flex-1 transition-all duration-500 ${
                  i === photoIndex ? "bg-white" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
