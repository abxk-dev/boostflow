"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LiveTicker } from "@/components/sections/live-ticker"
import { PhoneMockup } from "@/components/sections/phone-mockup"
import { ScrollReveal, StaggerChildren, Parallax, CountUp } from "@/components/ui/scroll-reveal"
import { useInView, useCountUp } from "@/hooks/use-in-view"
import { useEffect, useState } from "react"
import {
  Zap,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  Lock,
  Camera,
  Play,
  MessageSquare,
  Globe,
  Eye,
  DollarSign,
  BarChart3,
  Sparkles,
  Music,
  Video,
  Hash,
  Search,
} from "lucide-react"

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d62496" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="6" fill="url(#ig-grad)" />
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="white" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="white" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="22" height="22" rx="6" fill="#010101" />
      <path d="M16.5 5.5c0 0 0 2.2 2.5 3v2.3c-1.2 0-2.3-.4-3-.9v4.6c0 3-2.4 4.5-4.5 4.5-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5c.3 0 .5 0 .8.1v2.4c-.3-.1-.5-.1-.8-.1-1.2 0-2.1 1-2.1 2.1 0 1.2.9 2.1 2.1 2.1 1.2 0 2.2-.9 2.2-2.1V5.5h2.3z" fill="#25F4EE" />
      <path d="M17 6c0 0 0 2.2 2.5 3v2.3c-1.2 0-2.3-.4-3-.9v4.6c0 3-2.4 4.5-4.5 4.5-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5c.3 0 .5 0 .8.1v2.4c-.3-.1-.5-.1-.8-.1-1.2 0-2.1 1-2.1 2.1 0 1.2.9 2.1 2.1 2.1 1.2 0 2.2-.9 2.2-2.1V6H17z" fill="#FE2C55" />
      <path d="M16.8 5.8c0 0 0 2.2 2.5 3v2.3c-1.2 0-2.3-.4-3-.9v4.6c0 3-2.4 4.5-4.5 4.5-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5c.3 0 .5 0 .8.1v2.4c-.3-.1-.5-.1-.8-.1-1.2 0-2.1 1-2.1 2.1 0 1.2.9 2.1 2.1 2.1 1.2 0 2.2-.9 2.2-2.1V5.8h2.3z" fill="white" />
    </svg>
  )
}

const platforms = [
  { name: "Instagram Reels", icon: InstagramIcon, color: "from-pink-500 to-purple-600", tags: ["Reels", "Views", "Likes"] },
  { name: "TikTok Videos", icon: TikTokIcon, color: "from-cyan-400 to-pink-500", tags: ["Videos", "Views", "Followers"] },
]

const steps = [
  {
    step: "1",
    title: "Paste your link",
    description: "Drop the URL of the reel or video you want to boost.",
    icon: Globe,
  },
  {
    step: "2",
    title: "Watch a quick ad",
    description: "One short ad keeps the platform free for everyone.",
    icon: Eye,
  },
  {
    step: "3",
    title: "Boost auto-delivery",
    description: "Views and likes start flowing within minutes. Real engagement, real people.",
    icon: TrendingUp,
  },
  {
    step: "4",
    title: "Watch it climb",
    description: "Track your engagement rising in real-time. The algorithm notices momentum.",
    icon: BarChart3,
  },
]

const trustItems = [
  {
    title: "100% Safe & Secure",
    description: "We never touch your account. Only a public link is needed.",
    icon: Shield,
  },
  {
    title: "No Password Required",
    description: "Zero logins, zero credentials, zero risk to your profile.",
    icon: Lock,
  },
  {
    title: "Instant Start",
    description: "Boosts begin processing within minutes of your request.",
    icon: Clock,
  },
  {
    title: "Free. Actually Free.",
    description: "Watching one short ad covers the cost — you pay nothing.",
    icon: DollarSign,
  },
]

const faqs = [
  {
    question: "Is it really free?",
    answer: "Yes! BoostFlow is completely free to use. We support the platform through rewarded ad views. You never need to pay anything — just watch one short ad and your boost starts immediately.",
  },
  {
    question: "Do you need my password?",
    answer: "Absolutely not. We never ask for your password or login credentials. We only need your public profile URL or reel link to deliver engagement. Your account stays completely private.",
  },
  {
    question: "How fast does a boost start?",
    answer: "Most boosts begin processing within minutes. Depending on the service and quantity, you'll typically see results flowing in within 1-24 hours. Our median delivery time is just 12 minutes.",
  },
  {
    question: "Which platforms are supported?",
    answer: "We support all major social media platforms including Instagram, TikTok, YouTube Shorts, Twitter/X, and Facebook. We're constantly adding support for more platforms and features.",
  },
  {
    question: "Can a boost hurt my account?",
    answer: "No. We use real human engagement through our rewarded system. No bots, no automation, no fake accounts — nothing that violates platform terms of service. Your account safety is our top priority.",
  },
]

// Animated Counter Component
function AnimatedCounter({ end, suffix = "", prefix = "", duration = 2000 }: {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
}) {
  const { count, ref } = useCountUp(end, duration)

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// Section Wrapper with scroll animation
function AnimatedSection({
  children,
  className = "",
  delay = 0,
  animation = "fade-in-up"
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  animation?: string
}) {
  const { ref, isInView } = useInView({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={`${className} ${isInView ? `animate-${animation}` : "opacity-0-initial"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { ref: heroRef, isInView: heroInView } = useInView({ threshold: 0.1 })

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0F] scroll-smooth">
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
        {/* Aurora blobs */}
        <div className="aurora aurora-a w-[540px] h-[540px] -top-40 -left-40" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.22), transparent 65%)" }} />
        <div className="aurora aurora-b w-[620px] h-[620px] top-24 right-[-180px]" style={{ background: "radial-gradient(circle, rgba(0,229,255,0.14), transparent 65%)" }} />
        <div className="aurora aurora-c w-[420px] h-[420px] bottom-[-140px] left-[30%]" style={{ background: "radial-gradient(circle, rgba(255,46,159,0.12), transparent 65%)" }} />

        {/* Floating particles */}
        <div className="particle" style={{ top: "12%", left: "6%", width: 5, height: 5, background: "#00E5FF", boxShadow: "0 0 10px #00E5FF", animationDelay: "0s" }} />
        <div className="particle" style={{ top: "24%", left: "88%", width: 4, height: 4, background: "#8B5CF6", boxShadow: "0 0 10px #8B5CF6", animationDelay: "1.2s" }} />
        <div className="particle" style={{ top: "68%", left: "4%", width: 3, height: 3, background: "#FF2E9F", boxShadow: "0 0 10px #FF2E9F", animationDelay: "2.1s" }} />
        <div className="particle" style={{ top: "80%", left: "60%", width: 5, height: 5, background: "#00E5FF", boxShadow: "0 0 10px #00E5FF", animationDelay: "0.8s" }} />
        <div className="particle" style={{ top: "40%", left: "40%", width: 3, height: 3, background: "#8B5CF6", boxShadow: "0 0 10px #8B5CF6", animationDelay: "3s" }} />
        <div className="particle" style={{ top: "16%", left: "58%", width: 4, height: 4, background: "#FF2E9F", boxShadow: "0 0 10px #FF2E9F", animationDelay: "1.6s" }} />
        <div className="particle" style={{ top: "58%", left: "92%", width: 4, height: 4, background: "#00E5FF", boxShadow: "0 0 10px #00E5FF", animationDelay: "2.6s" }} />
        <div className="particle" style={{ top: "88%", left: "22%", width: 3, height: 3, background: "#8B5CF6", boxShadow: "0 0 10px #8B5CF6", animationDelay: "0.4s" }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 lg:gap-8 items-center w-full">
          {/* Left - Text Content */}
          <div>
            {/* Badge */}
            <ScrollReveal animation="fade-down" delay={0}>
              <div className="inline-flex items-center rounded-full glass-chip px-4 py-1.5 mb-8">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse mr-2" />
                <span className="text-xs text-white/70 tracking-wide">Free forever · No password · Starts in minutes</span>
              </div>
            </ScrollReveal>

            {/* Headline with masked reveal */}
            <ScrollReveal animation="fade-up" delay={100}>
              <h1 className="font-display text-[2.6rem] sm:text-6xl lg:text-[3.4rem] xl:text-[3.85rem] font-semibold leading-[1.06] tracking-tight" data-testid="hero-headline">
                <span className="block overflow-hidden pb-1">
                  <span className="block">Your reels,</span>
                </span>
                <span className="block overflow-hidden pb-1">
                  <span className="block">
                    seen by <span className="gradient-text-animated">real people</span>,
                  </span>
                </span>
                <span className="block overflow-hidden pb-1">
                  <span className="block">free in minutes.</span>
                </span>
              </h1>
            </ScrollReveal>

            {/* Subheadline */}
            <ScrollReveal animation="fade-up" delay={200}>
              <p className="mt-6 text-base md:text-lg text-white/60 leading-relaxed max-w-md" data-testid="hero-subheadline">
                Paste your reel link, watch one quick ad, and real views, likes and reach start rolling in. No signup walls. No catch.
              </p>
            </ScrollReveal>

            {/* CTA Buttons */}
            <ScrollReveal animation="fade-up" delay={300}>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <Link href="/boost">
                  <Button size="lg" className="cta-gradient animate-pulse-glow text-black font-semibold rounded-full px-8 h-12 text-base hover:opacity-90 transition-all hover:scale-105 active:scale-95" data-testid="hero-primary-cta">
                    Boost My Reel — Free
                    <ArrowRight className="ml-2 h-5 w-5" strokeWidth={2.5} />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="glass-chip rounded-full px-8 h-12 text-base text-white/80 hover:text-white hover:border-[#00E5FF]/40 hover:scale-105 transition-all" data-testid="hero-secondary-cta">
                    <Play className="mr-2 h-4 w-4" />
                    See How It Works
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Stats row */}
            <ScrollReveal animation="fade-up" delay={400}>
              <div className="mt-12 flex items-center gap-8" data-testid="hero-stats">
                {[
                  ["2.4M+", "boosts delivered"],
                  ["180K", "creators onboard"],
                  ["~3 min", "avg. start time"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <div className="font-display text-2xl font-semibold gradient-text-animated">{v}</div>
                    <div className="text-xs text-white/40 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right - Phone Mockup & Floating Icons */}
          <div className="relative flex justify-center lg:justify-end lg:pr-10">
            <ScrollReveal animation="scale" delay={300}>
              <PhoneMockup />
            </ScrollReveal>

            {/* Floating social icons */}
            {[
              { icon: Camera, color: "#FF2E9F", pos: "top-[2%] left-[2%] lg:left-[22%]", delay: 0 },
              { icon: Zap, color: "#00E5FF", pos: "top-[22%] -right-1 lg:right-0", delay: 0.6 },
              { icon: Video, color: "#FF4444", pos: "bottom-[26%] left-[2%] lg:left-[18%]", delay: 1.1 },
              { icon: Globe, color: "#8B5CF6", pos: "-bottom-3 right-[24%] lg:right-[16%]", delay: 0.3 },
              { icon: Hash, color: "#FFFFFF", pos: "top-[58%] left-[30%] hidden lg:flex", delay: 1.5 },
            ].map(({ icon: Icon, color, pos, delay }, i) => (
              <div
                key={i}
                className={`absolute ${pos} glass-chip w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center z-10 animate-float`}
                style={{
                  boxShadow: `0 0 24px -8px ${color}`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${4 + i * 0.5}s`,
                }}
                data-testid={`hero-floating-icon-${i}`}
              >
                <Icon size={22} style={{ color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Boost Ticker */}
      <AnimatedSection animation="fade-in">
        <LiveTicker />
      </AnimatedSection>

      {/* How It Works - "The Flow" — Bento Grid */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D14] via-[#0A0A0F] to-[#0A0A0F]" />

        {/* Ambient orbs */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="container relative px-4 md:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">01</span>
              <span className="w-1 h-1 rounded-full bg-violet-500" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">The Flow</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight">
              From link to <span className="gradient-text-animated">lift-off</span> in four steps
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              No sign-up gymnastics. No hidden paywalls. Just four simple steps to real growth.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">
            {/* Step 1 — Large card (spans 2 cols) */}
            <div className="lg:col-span-2 lg:row-span-2">
              <div className="relative h-full min-h-[280px] lg:min-h-0 rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-violet-600/15 via-[#0D0D14] to-cyan-600/10 p-7 flex flex-col justify-between group hover:border-violet-500/30 transition-all duration-300">
                {/* Step number watermark */}
                <span className="absolute -top-6 -right-4 text-[120px] font-black text-white/5 leading-none select-none pointer-events-none">01</span>

                <div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-violet-500/20">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">Paste your link</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Drop the URL of the reel or video you want to boost. Works with any public link from Instagram, TikTok, YouTube & more.
                  </p>
                </div>

                {/* Mini link preview mockup */}
                <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-violet-500/20 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shrink-0">
                    <Globe className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/70 font-medium truncate">instagram.com/reel/abc123...</div>
                    <div className="text-[10px] text-gray-500">Link detected ✓</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="lg:col-span-2">
              <div className="relative h-full min-h-[200px] rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-cyan-600/12 via-[#0D0D14] to-[#0D0D14] p-6 flex flex-col justify-between group hover:border-cyan-500/30 transition-all duration-300">
                <span className="absolute -top-4 -right-2 text-[80px] font-black text-white/5 leading-none select-none pointer-events-none">02</span>

                <div>
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/20">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">Watch a quick ad</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    One short ad keeps the platform free for everyone. Takes just seconds.
                  </p>
                </div>

                {/* Ad timer mockup */}
                <div className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="h-6 w-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <Eye className="h-3 w-3 text-cyan-400" />
                  </div>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full" />
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">5s</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="lg:col-span-2">
              <div className="relative h-full min-h-[200px] rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-emerald-600/12 via-[#0D0D14] to-[#0D0D14] p-6 flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-300">
                <span className="absolute -top-4 -right-2 text-[80px] font-black text-white/5 leading-none select-none pointer-events-none">03</span>

                <div>
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/20">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">Boost auto-delivery</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Views and likes start flowing within minutes. Real engagement, real people.
                  </p>
                </div>

                {/* Mini delivery indicator */}
                <div className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex -space-x-1.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                    <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/30" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-emerald-400 font-medium">Delivering to 847 viewers...</div>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Step 4 — Wide card */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-r from-amber-600/10 via-[#0D0D14] to-rose-600/10 p-6 md:p-7 group hover:border-amber-500/30 transition-all duration-300">
                <span className="absolute -top-4 right-8 text-[80px] font-black text-white/5 leading-none select-none pointer-events-none">04</span>

                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-start gap-5 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-amber-500/20">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-amber-300 transition-colors">Watch it climb</h3>
                      <p className="text-sm text-gray-400 leading-relaxed max-w-md">
                        Track your engagement rising in real-time. The algorithm notices momentum and pushes your content further.
                      </p>
                    </div>
                  </div>

                  {/* Mini chart mockup */}
                  <div className="flex items-end gap-2 h-16 px-4">
                    {[25, 40, 35, 55, 50, 70, 65, 85, 80, 95].map((h, i) => (
                      <div
                        key={i}
                        className="w-3 md:w-4 rounded-t-md bg-gradient-to-t from-amber-500 to-rose-400 opacity-60 group-hover:opacity-100 transition-all duration-500"
                        style={{
                          height: `${h}%`,
                          animationDelay: `${i * 80}ms`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Stat badges */}
                  <div className="flex gap-3 shrink-0">
                    <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-center">
                      <div className="text-sm font-bold text-white">+312%</div>
                      <div className="text-[10px] text-gray-500">reach</div>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-center">
                      <div className="text-sm font-bold text-amber-400">12 min</div>
                      <div className="text-[10px] text-gray-500">delivery</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Platforms Section — Bento Grid */}
      <section id="platforms" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0D0D14]" />
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full bg-pink-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

        <div className="container relative px-4 md:px-6">
          <ScrollReveal animation="fade-up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-medium mb-6">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">02</span>
              <span className="w-1 h-1 rounded-full bg-pink-500" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Platforms</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight">
              Every platform your <span className="gradient-text-animated">audience</span> lives on
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              One boost engine, two powerful platforms. Instagram Reels & TikTok Videos.
            </p>
          </ScrollReveal>

          {/* Platform Bento Grid */}
          <StaggerChildren className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8" staggerDelay={100}>
            {platforms.map((platform) => (
              <div key={platform.name} className="group">
                <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-8 text-center hover:border-violet-500/30 transition-all duration-500 h-full flex flex-col items-center">
                  {/* Background glow on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-0 group-hover:opacity-15 transition-opacity duration-500`} />

                  {/* Logo with glow effect */}
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 scale-150`} />
                    <platform.icon className="relative h-20 w-20 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl" />
                  </div>

                  <h3 className="relative font-bold text-white mb-3 text-xl">{platform.name}</h3>

                  <div className="relative flex flex-wrap justify-center gap-2">
                    {platform.tags.map(tag => (
                      <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-gray-300 border border-white/10 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Growth / Algorithm Section — Bento Grid */}
      <section id="growth" className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

        <div className="container relative px-4 md:px-6">
          <ScrollReveal animation="fade-up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">03</span>
              <span className="w-1 h-1 rounded-full bg-violet-500" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Growth</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight">
              The algorithm notices <span className="gradient-text-animated">momentum</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Early engagement signals tell platforms your content is worth pushing. Our boosts
              give your reels that critical first wave of real interaction — and the algorithm responds.
            </p>
          </ScrollReveal>

          {/* Stats + Chart Bento */}
          <StaggerChildren className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-8" staggerDelay={100}>
            <div className="group">
              <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-violet-600/15 to-transparent p-8 text-center hover:border-violet-500/30 transition-all duration-300 h-full">
                <div className="absolute -top-4 -right-4 text-[80px] font-black text-white/5 leading-none select-none pointer-events-none">%</div>
                <div className="text-5xl font-bold gradient-text-animated mb-3">+312%</div>
                <div className="text-sm text-gray-400">avg. reach lift</div>
              </div>
            </div>
            <div className="group">
              <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-cyan-600/15 to-transparent p-8 text-center hover:border-cyan-500/30 transition-all duration-300 h-full">
                <div className="absolute -top-4 -right-4 text-[80px] font-black text-white/5 leading-none select-none pointer-events-none">⏱</div>
                <div className="text-5xl font-bold text-white mb-3">12 min</div>
                <div className="text-sm text-gray-400">median delivery</div>
              </div>
            </div>
            <div className="group">
              <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-emerald-600/15 to-transparent p-8 text-center hover:border-emerald-500/30 transition-all duration-300 h-full">
                <div className="absolute -top-4 -right-4 text-[80px] font-black text-white/5 leading-none select-none pointer-events-none">$</div>
                <div className="text-5xl font-bold text-emerald-400 mb-3">$0</div>
                <div className="text-sm text-gray-400">cost to you</div>
              </div>
            </div>
          </StaggerChildren>

          {/* Chart Card */}
          <ScrollReveal animation="scale" delay={200}>
            <div className="max-w-5xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-6 md:p-8 group hover:border-violet-500/30 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Engagement Growth</h3>
                    <p className="text-sm text-gray-500">Real-time boost delivery over the last 7 days</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                    <TrendingUp className="h-4 w-4" />
                    +248% this week
                  </div>
                </div>

                {/* Chart */}
                <div className="h-56 flex items-end gap-4 md:gap-6">
                  {[35, 52, 45, 68, 58, 82, 95].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                      <div className="relative w-full">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover/bar:opacity-100 transition-opacity font-mono">
                          {Math.round(h * 120)}
                        </div>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-blue-500 transition-all duration-500 group-hover:from-violet-500 group-hover:to-cyan-400"
                          style={{ height: `${h * 2}px` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Trust / Safety Section — Bento Grid */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0D0D14]" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

        <div className="container relative px-4 md:px-6">
          <ScrollReveal animation="fade-up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">04</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Security</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight">
              Built to grow you, <span className="gradient-text-animated">never to risk you</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              Your safety and privacy come first. Always. Zero compromises.
            </p>
          </ScrollReveal>

          {/* Trust Bento Grid */}
          <StaggerChildren className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5" staggerDelay={100}>
            {trustItems.map((item, index) => (
              <div key={item.title} className="group">
                <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-6 flex gap-5 hover:border-emerald-500/30 transition-all duration-300 h-full">
                  {/* Accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                    <item.icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* FAQ Section — Modern Accordion */}
      <section id="faq" className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6">
          <ScrollReveal animation="fade-up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">05</span>
              <span className="w-1 h-1 rounded-full bg-violet-500" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Questions</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight">
              Asked <span className="gradient-text-animated">often</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              Got questions? We&apos;ve got answers.
            </p>
          </ScrollReveal>

          {/* FAQ Grid */}
          <StaggerChildren className="max-w-2xl mx-auto flex flex-col gap-4" staggerDelay={100}>
            {faqs.map((faq, index) => (
              <div key={index} className="group w-full">
                <details className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-white/5 to-transparent hover:border-violet-500/30 transition-all duration-300 w-full">
                  <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none">
                    <span className="font-medium text-white pr-4 group-hover:text-violet-300 transition-colors">{faq.question}</span>
                    <span className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-gray-400 text-sm shrink-0 group-open:rotate-45 group-open:bg-violet-500/20 group-open:text-violet-400 transition-all duration-300">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-sm text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Bottom CTA — Modern */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] to-[#0D0D14]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-violet-600/15 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />

        <div className="container relative px-4 md:px-6">
          <ScrollReveal animation="scale" delay={100}>
            <div className="max-w-4xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-br from-violet-600/10 via-[#0D0D14] to-cyan-600/10 p-10 md:p-16 text-center">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`, backgroundSize: '32px 32px' }} />

                <div className="relative">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                    Your next reel deserves <span className="gradient-text-animated">real momentum</span>
                  </h2>
                  <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                    Join 180,000+ creators who trust BoostFlow to kickstart their growth. Free, fast, and safe.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/boost">
                      <Button size="lg" className="cta-gradient animate-pulse-glow text-black font-semibold rounded-full px-10 h-14 text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Start Your Free Boost
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/track">
                      <Button size="lg" variant="outline" className="glass-chip border-white/10 text-white hover:bg-white/10 rounded-full px-10 h-14 text-lg hover:scale-105 active:scale-95">
                        <Search className="mr-2 h-5 w-5" />
                        Track Existing Order
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
