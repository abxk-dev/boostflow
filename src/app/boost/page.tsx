"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { OrderForm } from "@/components/order/order-form"
import {
  Zap,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Eye,
  Heart,
  Star,
  Rocket,
  Bolt,
} from "lucide-react"

export default function BoostPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0F]">
      <Header />

      <main className="flex-1 relative">
        {/* Hero Section with Mesh Gradient */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Animated mesh gradient background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/30 blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[100px] animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-pink-500/15 blur-[80px] animate-pulse" style={{ animationDuration: "10s", animationDelay: "4s" }} />
          </div>

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative container mx-auto px-4 md:px-6 py-20">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30 text-sm font-medium mb-8 backdrop-blur-sm">
                <Bolt className="h-4 w-4 text-violet-400" />
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
                  Free Boost System
                </span>
              </div>

              {/* Main heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 tracking-tight leading-[1.1]">
                <span className="block">Boost Your</span>
                <span className="block mt-2 bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  Social Media
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
                Get real views, likes, and followers for your content.{" "}
                <span className="text-white font-medium">No account needed</span> — just watch a quick ad and start growing.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {[
                  { icon: CheckCircle2, text: "100% Free", color: "text-emerald-400" },
                  { icon: Clock, text: "Instant Start", color: "text-cyan-400" },
                  { icon: Shield, text: "Safe & Secure", color: "text-violet-400" },
                  { icon: Star, text: "No Signup", color: "text-yellow-400" },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    {item.text}
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { value: "180K+", label: "Active Users", icon: Users },
                  { value: "12.5K", label: "Orders Today", icon: Zap },
                  { value: "< 1hr", label: "Avg Delivery", icon: Clock },
                  { value: "99.8%", label: "Success Rate", icon: Shield },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/30 transition-all duration-300"
                  >
                    <stat.icon className="h-5 w-5 text-violet-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0F] to-transparent" />
        </section>

        {/* Order Form Section */}
        <section className="relative -mt-16 pb-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              {/* Glow effect behind form */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-20 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />

              <div className="relative">
                {/* Form header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
                    <Rocket className="h-3.5 w-3.5" />
                    <span>Start in 30 seconds</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Choose Your Boost
                  </h2>
                </div>

                {/* Form container */}
                <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl p-8 md:p-10">
                  <OrderForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Bento Grid */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              {/* Section header */}
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Why creators <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">love us</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-md mx-auto">
                  The simplest way to boost your social media presence
                </p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Large feature card */}
                <div className="md:col-span-2 group relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-violet-500/10 to-transparent p-8 hover:border-violet-500/30 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-violet-500/30">
                      <Zap className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">100% Free Forever</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      Our service is completely free. Just watch a short ad to support the platform.
                      No hidden fees, no premium tiers, no tricks.
                    </p>
                  </div>
                </div>

                {/* Small feature card */}
                <div className="group relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-cyan-500/10 to-transparent p-8 hover:border-cyan-500/30 transition-all duration-500">
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-cyan-500/30">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">Lightning Fast</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Orders processed instantly. See results within minutes, not hours.
                    </p>
                  </div>
                </div>

                {/* Small feature card */}
                <div className="group relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent p-8 hover:border-emerald-500/30 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-emerald-500/30">
                      <Shield className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">Safe & Secure</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Industry-standard security. Your data and accounts are always protected.
                    </p>
                  </div>
                </div>

                {/* Large feature card */}
                <div className="md:col-span-2 group relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-pink-500/10 to-transparent p-8 hover:border-pink-500/30 transition-all duration-500">
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-pink-500/30">
                      <Eye className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-300 transition-colors">Real Engagement Only</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      We deliver real views, likes, and followers from genuine accounts.
                      No bots, no fake engagement, no risk to your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platforms Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />
          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Supported <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">Platforms</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-md mx-auto">
                  Boost your content on the platforms that matter
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instagram */}
                <div className="group relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent p-8 hover:border-pink-500/30 transition-all duration-500">
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex items-start gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-xl shadow-pink-500/30">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3">Instagram Reels</h3>
                      <p className="text-gray-400 mb-4">
                        Boost your Reels views, likes, and comments to increase reach and engagement.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["Views", "Likes", "Comments", "Shares"].map((tag) => (
                          <span key={tag} className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-white/70 border border-white/10">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* TikTok */}
                <div className="group relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-cyan-500/10 via-pink-500/5 to-transparent p-8 hover:border-cyan-500/30 transition-all duration-500">
                  <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-cyan-500/30 to-pink-500/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex items-start gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-xl shadow-cyan-500/30">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3">TikTok Videos</h3>
                      <p className="text-gray-400 mb-4">
                        Get more views, likes, and followers on your TikTok content to go viral.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["Views", "Likes", "Followers", "Shares"].map((tag) => (
                          <span key={tag} className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-white/70 border border-white/10">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-cyan-500 to-pink-500" />
                <div className="absolute inset-0 bg-[#0A0A0F]/80" />

                {/* Animated elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-violet-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
                  <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s", animationDelay: "2s" }} />
                </div>

                {/* Grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
                    backgroundSize: "24px 24px",
                  }}
                />

                <div className="relative p-12 md:p-16 text-center">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                    Ready to <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">grow</span>?
                  </h2>
                  <p className="text-xl text-gray-300 mb-10 max-w-lg mx-auto">
                    Join thousands of creators already boosting their content
                  </p>

                  <a
                    href="#order-form"
                    className="group relative inline-flex items-center gap-3 px-12 py-5 bg-white text-black font-bold text-lg rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl shadow-white/20"
                  >
                    <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    <span>Start Your Free Boost</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </a>

                  <div className="flex flex-wrap justify-center gap-6 mt-10">
                    {[
                      "No signup required",
                      "Results in minutes",
                      "100% safe",
                      "Cancel anytime",
                    ].map((text) => (
                      <div key={text} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
