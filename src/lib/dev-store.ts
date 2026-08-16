// Shared in-memory store for development without MongoDB
// This file should only be used in development mode

interface Reward {
  rewardToken: string
  serviceId: string
  ip: string
  expiresAt: Date
  isUsed: boolean
  createdAt: Date
}

interface Order {
  orderId: string
  requestId: string
  trackingId: string
  serviceId: string
  platformId: string
  targetUrl: string
  quantity: number
  status: string
  isGuest: boolean
  startedAt: Date
  ip: string
}

export interface Platform {
  _id: string
  name: string
  slug: string
  icon: string
}

export interface Service {
  _id: string
  name: string
  description: string
  minQuantity: number
  maxQuantity: number
  isFreeTier: boolean
  dailyFreeLimit: number
  platformId: Platform
  sortOrder: number
}

// Sample platforms for development
export const SAMPLE_PLATFORMS: Platform[] = [
  { _id: "plat-1", name: "Instagram", slug: "instagram", icon: "instagram" },
  { _id: "plat-2", name: "TikTok", slug: "tiktok", icon: "tiktok" },
]

// Sample services for development
export const SAMPLE_SERVICES: Service[] = [
  {
    _id: "svc-1",
    name: "Instagram Views",
    description: "Get real views for your Instagram reels and posts",
    minQuantity: 100,
    maxQuantity: 100000,
    isFreeTier: true,
    dailyFreeLimit: 1000,
    platformId: SAMPLE_PLATFORMS[0],
    sortOrder: 1,
  },
  {
    _id: "svc-2",
    name: "Instagram Likes",
    description: "Boost engagement with real likes on your content",
    minQuantity: 50,
    maxQuantity: 50000,
    isFreeTier: true,
    dailyFreeLimit: 500,
    platformId: SAMPLE_PLATFORMS[0],
    sortOrder: 2,
  },
  {
    _id: "svc-3",
    name: "Instagram Followers",
    description: "Grow your audience with real followers",
    minQuantity: 100,
    maxQuantity: 10000,
    isFreeTier: false,
    dailyFreeLimit: 0,
    platformId: SAMPLE_PLATFORMS[0],
    sortOrder: 3,
  },
  {
    _id: "svc-4",
    name: "TikTok Views",
    description: "Get real views for your TikTok videos",
    minQuantity: 500,
    maxQuantity: 500000,
    isFreeTier: true,
    dailyFreeLimit: 2000,
    platformId: SAMPLE_PLATFORMS[1],
    sortOrder: 1,
  },
  {
    _id: "svc-5",
    name: "TikTok Likes",
    description: "Boost your TikTok engagement with real likes",
    minQuantity: 100,
    maxQuantity: 100000,
    isFreeTier: true,
    dailyFreeLimit: 1000,
    platformId: SAMPLE_PLATFORMS[1],
    sortOrder: 2,
  },
  {
    _id: "svc-6",
    name: "TikTok Followers",
    description: "Grow your TikTok following with real users",
    minQuantity: 100,
    maxQuantity: 50000,
    isFreeTier: false,
    dailyFreeLimit: 0,
    platformId: SAMPLE_PLATFORMS[1],
    sortOrder: 3,
  },
]

// Helper functions
export function getServiceById(serviceId: string): Service | undefined {
  return SAMPLE_SERVICES.find((s) => s._id === serviceId)
}

export function getServiceBySlug(platformSlug: string, serviceName: string): Service | undefined {
  return SAMPLE_SERVICES.find(
    (s) => s.platformId.slug === platformSlug && s.name.toLowerCase().includes(serviceName.toLowerCase())
  )
}

export function getServicesByPlatform(platformSlug: string): Service[] {
  return SAMPLE_SERVICES.filter((s) => s.platformId.slug === platformSlug)
}

// Singleton stores
const rewardStore = new Map<string, Reward>()
const orderStore = new Map<string, Order>()

export function getRewardStore() {
  return rewardStore
}

export function getOrderStore() {
  return orderStore
}

export function addReward(reward: Reward) {
  rewardStore.set(reward.rewardToken, reward)
}

export function getReward(token: string) {
  return rewardStore.get(token)
}

export function markRewardUsed(token: string) {
  const reward = rewardStore.get(token)
  if (reward) {
    reward.isUsed = true
  }
}

export function addOrder(order: Order) {
  orderStore.set(order.orderId, order)
}

export function getOrderByRequestId(requestId: string) {
  for (const order of orderStore.values()) {
    if (order.requestId === requestId) {
      return order
    }
  }
  return null
}

export function getOrderByTrackingId(trackingId: string) {
  for (const order of orderStore.values()) {
    if (order.trackingId === trackingId) {
      return order
    }
  }
  return null
}

// Clean up expired rewards periodically
setInterval(() => {
  const now = new Date()
  for (const [key, reward] of rewardStore.entries()) {
    if (reward.expiresAt < now) {
      rewardStore.delete(key)
    }
  }
}, 60 * 1000) // Clean up every minute
