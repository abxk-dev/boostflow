"use client"

import { useEffect, useState, useRef } from "react"
import { Heart, Eye, TrendingUp, Share2, MessageCircle, Play, Zap, Music2 } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const activities = [
  { flag: "🇦🇪", user: "@dubai.lifestyle", action: "+540 views delivered", time: "2 min ago", platform: "Instagram" },
  { flag: "🇧🇷", user: "@lucas.oficial", action: "+120 likes on a Reel", time: "just now", platform: "TikTok" },
  { flag: "🇮🇳", user: "@priya_vlogs", action: "+2.1K views delivered", time: "1 min ago", platform: "YouTube" },
  { flag: "🇺🇸", user: "@sarah_creates", action: "+890 followers gained", time: "3 min ago", platform: "Instagram" },
  { flag: "🇬🇧", user: "@london.eats", action: "+567 saves delivered", time: "4 min ago", platform: "Instagram" },
  { flag: "🇩🇪", user: "@berlin.tech", action: "+1.8K views delivered", time: "5 min ago", platform: "TikTok" },
  { flag: "🇯🇵", user: "@tokyo.anime", action: "+3.4K likes delivered", time: "6 min ago", platform: "YouTube" },
  { flag: "🇫🇷", user: "@paris.mode", action: "+280% engagement boost", time: "7 min ago", platform: "Instagram" },
  { flag: "🇨🇦", user: "@toronto.life", action: "+1.2K views delivered", time: "8 min ago", platform: "TikTok" },
  { flag: "🇦🇺", user: "@sydney.fit", action: "+450 followers gained", time: "9 min ago", platform: "Instagram" },
  { flag: "🇰🇷", user: "@seoul.beauty", action: "+2.7K likes delivered", time: "10 min ago", platform: "YouTube" },
  { flag: "🇧🇷", user: "@rio.music", action: "+420% reach boost", time: "11 min ago", platform: "TikTok" },
]

const reelData = [
  {
    handle: "@sarah.styles",
    platform: "Instagram",
    gradient: "from-pink-500 to-purple-500",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=500&fit=crop&crop=face",
    caption: "Golden hour vibes ✨",
    views: 48210,
    likes: 3900,
    comments: 412,
  },
  {
    handle: "@mia.lifestyle",
    platform: "TikTok",
    gradient: "from-cyan-400 to-pink-500",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=500&fit=crop&crop=face",
    caption: "New dance trend 💃🔥",
    views: 32450,
    likes: 2800,
    comments: 298,
  },
]

export function LiveTicker() {
  const [views1, setViews1] = useState(reelData[0].views)
  const [likes1, setLikes1] = useState(reelData[0].likes)
  const [comments1, setComments1] = useState(reelData[0].comments)
  const [views2, setViews2] = useState(reelData[1].views)
  const [likes2, setLikes2] = useState(reelData[1].likes)
  const [comments2, setComments2] = useState(reelData[1].comments)
  const containerRef = useRef<HTMLDivElement>(null)
  const { ref: sectionRef, isInView } = useInView({ threshold: 0.1 })

  useEffect(() => {
    const interval = setInterval(() => {
      setViews1((v) => v + Math.floor(Math.random() * 5) + 1)
      setLikes1((l) => l + Math.floor(Math.random() * 3))
      setComments1(() => reelData[0].comments + Math.floor(Math.random() * 50))
      setViews2((v) => v + Math.floor(Math.random() * 5) + 1)
      setLikes2((l) => l + Math.floor(Math.random() * 3))
      setComments2(() => reelData[1].comments + Math.floor(Math.random() * 50))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section ref={sectionRef} className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A1A] via-[#0F0F23] to-[#0A0A1A]" />

      {/* Animated background orbs */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-green-500/5 blur-[100px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none animate-float" />

      <div className="container relative px-4 md:px-6">
        <div className={`text-center mb-12 transition-all duration-700 ${isInView ? "animate-fade-in-up" : "opacity-0-initial"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-4 animate-border-glow">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE ACTIVITY
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Real-time boosts happening now
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Join thousands of creators already growing their presence. Watch the live feed of boosts being delivered.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          {/* Single Card with 2 Reels */}
          <div className={`relative transition-all duration-700 delay-200 ${isInView ? "animate-fade-in-left" : "opacity-0-initial"}`}>
            <div className="glass-card rounded-3xl p-5 max-w-sm mx-auto hover:border-violet-500/30 transition-all duration-300">
              {/* 2 Reels side by side */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {reelData.map((reel, i) => {
                  const views = i === 0 ? views1 : views2
                  const likes = i === 0 ? likes1 : likes2
                  const comments = i === 0 ? comments1 : comments2

                  return (
                    <div key={i} className="relative group">
                      {/* Reel thumbnail */}
                      <div className="relative rounded-xl overflow-hidden aspect-[9/14]">
                        <img
                          src={reel.image}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                        {/* Platform badge */}
                        <div className="absolute top-2 left-2 z-10">
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 ${i === 0 ? "text-pink-400" : "text-cyan-400"}`}>
                            {reel.platform}
                          </span>
                        </div>

                        {/* Boosting badge */}
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-md px-1.5 py-0.5">
                          <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[8px] font-semibold text-green-400">LIVE</span>
                        </div>

                        {/* Play button */}
                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${reel.gradient} flex items-center justify-center shadow-lg opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
                            <Play className="h-4 w-4 text-white ml-0.5" />
                          </div>
                        </div>

                        {/* Bottom info */}
                        <div className="absolute bottom-0 inset-x-0 z-10 p-2">
                          <div className="text-[10px] font-bold text-white truncate">{reel.handle}</div>
                          <div className="flex items-center gap-1 text-white/40">
                            <Music2 size={8} />
                            <span className="text-[8px] truncate">{reel.caption}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mini stats */}
                      <div className="flex items-center justify-between mt-2 px-0.5">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-violet-400" />
                          <span className="text-[10px] font-semibold text-white tabular-nums">{(views / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-pink-400" />
                          <span className="text-[10px] font-semibold text-white tabular-nums">{(likes / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3 text-blue-400" />
                          <span className="text-[10px] font-semibold text-white tabular-nums">{comments}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Combined engagement total */}
              <div className="flex items-center justify-between py-3 px-3 rounded-xl bg-white/5 border border-white/5 mb-4">
                <div className="text-center">
                  <div className="flex items-center gap-1.5 justify-center mb-0.5">
                    <Eye className="h-3.5 w-3.5 text-violet-400" />
                    <span className="text-sm font-bold text-white tabular-nums">{((views1 + views2) / 1000).toFixed(1)}K</span>
                  </div>
                  <span className="text-[10px] text-gray-500">total views</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <div className="flex items-center gap-1.5 justify-center mb-0.5">
                    <Heart className="h-3.5 w-3.5 text-pink-400" />
                    <span className="text-sm font-bold text-white tabular-nums">{((likes1 + likes2) / 1000).toFixed(1)}K</span>
                  </div>
                  <span className="text-[10px] text-gray-500">total likes</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <div className="flex items-center gap-1.5 justify-center mb-0.5">
                    <Zap className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-sm font-bold text-green-400">Active</span>
                  </div>
                  <span className="text-[10px] text-gray-500">boosting</span>
                </div>
              </div>

              {/* Share Button */}
              <button className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-300 transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                <Share2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                Share
              </button>
            </div>
          </div>

          {/* Activity Feed */}
          <div className={`transition-all duration-700 delay-400 ${isInView ? "animate-fade-in-right" : "opacity-0-initial"}`}>
            <div className="glass-card rounded-2xl p-4 h-[460px] overflow-hidden relative hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4 px-2">
                <TrendingUp className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-gray-300">Live Feed</span>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              </div>
              <div
                ref={containerRef}
                className="space-y-2 overflow-hidden h-[400px]"
                style={{ maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)" }}
              >
                <div className="animate-[scroll-up_30s_linear_infinite]">
                  {[...activities, ...activities].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:scale-[1.02] transition-all duration-200 cursor-default"
                    >
                      <span className="text-xl">{item.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">{item.user}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                            {item.platform}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{item.action}</span>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
