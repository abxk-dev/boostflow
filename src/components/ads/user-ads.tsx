"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"

/**
 * Loads ad scripts only on user-facing pages.
 * Admin pages ((admin)/*) are excluded.
 */
export function UserAds() {
  const pathname = usePathname()

  // Don't load ads on admin pages
  if (pathname?.startsWith("/admin")) {
    return null
  }

  return (
    <>
      {/* Push Notifications Ad */}
      <Script
        src="https://5gvci.com/act/files/tag.min.js?z=10664426"
        data-cfasync="false"
        strategy="afterInteractive"
      />

      {/* Vignette Banner Ad */}
      <Script id="vignette-ad" strategy="afterInteractive">
        {`(function(s){s.dataset.zone='10628454',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
      </Script>
    </>
  )
}
