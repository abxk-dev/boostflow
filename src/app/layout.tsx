import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/providers/theme-provider"
import { SessionProvider } from "@/providers/session-provider"
import { Toaster } from "@/components/ui/toaster"
import { AdScripts } from "@/components/ads/ad-scripts"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "BoostFlow - Free Social Media Growth Platform",
    template: "%s | BoostFlow",
  },
  description:
    "Boost your social media presence for free. Get followers, likes, views, and more across Instagram, TikTok, YouTube, and other platforms through our rewarded engagement system.",
  keywords: [
    "social media growth",
    "free followers",
    "instagram growth",
    "tiktok views",
    "youtube subscribers",
    "social media marketing",
    "free engagement",
  ],
  authors: [{ name: "BoostFlow" }],
  creator: "BoostFlow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://boostflow.com",
    siteName: "BoostFlow",
    title: "BoostFlow - Free Social Media Growth Platform",
    description:
      "Boost your social media presence for free. Get followers, likes, views, and more across all major platforms.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BoostFlow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BoostFlow - Free Social Media Growth Platform",
    description:
      "Boost your social media presence for free. Get followers, likes, views, and more across all major platforms.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
        <AdScripts />
      </body>
    </html>
  )
}
