"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, Menu, X, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-colors duration-300",
          scrolled
            ? "bg-[#0A0A0F]/70 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-transparent"
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
            <div className="h-8 w-8 rounded-xl cta-gradient flex items-center justify-center shadow-[0_0_20px_-4px_rgba(0,229,255,0.7)]">
              <Zap className="h-5 w-5 text-black" strokeWidth={2.5} />
            </div>
            <span className="gradient-text font-extrabold">
              BoostFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/boost"
              className="text-sm font-medium text-[#00E5FF] hover:text-[#00E5FF]/80 transition-colors duration-200 flex items-center gap-1"
            >
              <Zap className="h-3.5 w-3.5" />
              Start Boost
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
            >
              How It Works
            </Link>
            <Link
              href="#platforms"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
            >
              Platforms
            </Link>
            <Link
              href="/track"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200 flex items-center gap-1"
            >
              <Search className="h-3.5 w-3.5" />
              Track Order
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/boost">
              <Button size="sm" className="cta-gradient text-black font-semibold rounded-full px-5 shadow-[0_0_24px_-6px_rgba(0,229,255,0.6)] hover:shadow-[0_0_36px_-4px_rgba(0,229,255,0.85)] transition-shadow">
                <Zap className="mr-2 h-4 w-4" />
                Start Boosting
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/60 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Tagline Strip */}
        <div className={cn(
          "hidden md:block border-t border-white/[0.05] transition-all duration-300",
          scrolled ? "bg-[#0A0A0F]/50" : "bg-transparent"
        )}>
          <div className="container px-4 md:px-6 py-2 flex items-center justify-center gap-6 text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
              Free forever
            </span>
            <span>·</span>
            <span>No password required</span>
            <span>·</span>
            <span>Starts in minutes</span>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 top-16 z-40 bg-[#0A0A0F]/95 backdrop-blur-xl md:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="container px-4 py-8 space-y-6">
          <Link
            href="/boost"
            className="block py-3 text-lg font-medium text-[#00E5FF] hover:text-[#00E5FF]/80 transition-colors flex items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Zap className="h-5 w-5" />
            Start Boost
          </Link>
          <Link
            href="#how-it-works"
            className="block py-3 text-lg font-medium text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="#platforms"
            className="block py-3 text-lg font-medium text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Platforms
          </Link>
          <Link
            href="/track"
            className="block py-3 text-lg font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Search className="h-5 w-5" />
            Track Order
          </Link>
          <div className="border-t border-white/10 pt-6">
            <Link href="/boost" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full cta-gradient text-black font-semibold rounded-full">
                <Zap className="mr-2 h-4 w-4" />
                Start Boosting — Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
