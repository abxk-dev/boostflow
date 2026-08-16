"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Zap, ArrowRight, Users, Heart, Eye, MessageCircle, Share2 } from "lucide-react"

interface Platform {
  _id: string
  name: string
  slug: string
  icon: string
}

interface Service {
  _id: string
  name: string
  description: string
  minQuantity: number
  maxQuantity: number
  isFreeTier: boolean
  dailyFreeLimit: number
  platformId: Platform
}

const serviceIcons: Record<string, React.ReactNode> = {
  followers: <Users className="h-6 w-6" />,
  likes: <Heart className="h-6 w-6" />,
  views: <Eye className="h-6 w-6" />,
  comments: <MessageCircle className="h-6 w-6" />,
  shares: <Share2 className="h-6 w-6" />,
}

function getServiceIcon(name: string) {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(serviceIcons)) {
    if (lower.includes(key)) return icon
  }
  return <Zap className="h-6 w-6" />
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesRes, platformsRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/platforms"),
        ])

        const servicesData = await servicesRes.json()
        const platformsData = await platformsRes.json()

        if (servicesData.success) setServices(servicesData.data)
        if (platformsData.success) setPlatforms(platformsData.data)
      } catch (error) {
        console.error("Failed to fetch services:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredServices = selectedPlatform === "all"
    ? services
    : services.filter((s) => s.platformId?._id === selectedPlatform)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="gradient-text">Services</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from a variety of services across all major social media platforms.
              All services are completely free - just watch a quick ad.
            </p>
          </div>
        </section>

        {/* Platform Filter */}
        <section className="py-8 border-b">
          <div className="container px-4 md:px-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedPlatform === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPlatform("all")}
                className={selectedPlatform === "all" ? "gradient-bg text-white" : ""}
              >
                All Platforms
              </Button>
              {platforms.map((platform) => (
                <Button
                  key={platform._id}
                  variant={selectedPlatform === platform._id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPlatform(platform._id)}
                  className={selectedPlatform === platform._id ? "gradient-bg text-white" : ""}
                >
                  {platform.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No services available for this platform</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <Card key={service._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center mb-4">
                        {getServiceIcon(service.name)}
                      </div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        {service.isFreeTier && (
                          <Badge variant="success" className="text-xs">Free</Badge>
                        )}
                      </div>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>{service.platformId?.name}</span>
                        <span>{service.minQuantity} - {service.maxQuantity.toLocaleString()}</span>
                      </div>
                      {service.isFreeTier && (
                        <p className="text-xs text-muted-foreground mb-4">
                          {service.dailyFreeLimit} free orders per day
                        </p>
                      )}
                      <Link href={`/dashboard?service=${service._id}`}>
                        <Button className="w-full gradient-bg text-white">
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
