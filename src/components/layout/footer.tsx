import Link from "next/link"
import { Zap, Globe, Music2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0A0A0F] relative">
      {/* Top gradient glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent opacity-50" />
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-[#00E5FF] via-[#8B5CF6] to-[#FF2E9F] opacity-30 blur-sm" />

      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-5xl mx-auto">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="h-8 w-8 rounded-xl cta-gradient flex items-center justify-center shadow-[0_0_20px_-4px_rgba(0,229,255,0.7)]">
                <Zap className="h-5 w-5 text-black" strokeWidth={2.5} />
              </div>
              <span className="gradient-text font-extrabold">BoostFlow</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              Free engagement boosts for creators. Real reach, delivered in minutes.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="h-9 w-9 rounded-full glass-chip flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full glass-chip flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full glass-chip flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <Music2 className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full glass-chip flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services" className="text-sm text-white/40 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-white/40 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/growth" className="text-sm text-white/40 hover:text-white transition-colors">
                  Growth
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-white/40 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-white/40 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-white/40 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white/40 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/track" className="text-sm text-white/40 hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-white/40 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white/40 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; 2026 BoostFlow. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Grow loud, stay safe.
          </p>
        </div>
      </div>
    </footer>
  )
}
