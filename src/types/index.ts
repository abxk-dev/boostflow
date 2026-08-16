import { Types } from "mongoose"

// User types
export interface IUser {
  _id: Types.ObjectId
  email: string
  username: string
  passwordHash: string
  role: "user" | "admin"
  isActive: boolean
  ipHistory: string[]
  deviceFingerprints: string[]
  dailyOrderCount: number
  lastOrderReset: Date
  createdAt: Date
  updatedAt: Date
}

// Platform types (Instagram, TikTok, YouTube, etc.)
export interface IPlatform {
  _id: Types.ObjectId
  name: string
  slug: string
  icon: string
  urlPattern: string // Regex for validating URLs
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

// Service types (followers, likes, views, etc.)
export interface IService {
  _id: Types.ObjectId
  platformId: Types.ObjectId
  name: string
  description: string
  minQuantity: number
  maxQuantity: number
  pricePerUnit: number
  isFreeTier: boolean
  dailyFreeLimit: number
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

// Provider types
export interface IProvider {
  _id: Types.ObjectId
  name: string
  apiUrl: string
  apiKey: string // Encrypted
  apiSecret?: string // Encrypted
  isActive: boolean
  priority: number
  timeoutMs: number
  maxRetries: number
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// Provider-Service mapping
export interface IProviderService {
  _id: Types.ObjectId
  providerId: Types.ObjectId
  serviceId: Types.ObjectId
  externalServiceId: string
  costPerUnit: number
  isActive: boolean
  priority: number
  minQuantity: number
  maxQuantity: number
  createdAt: Date
  updatedAt: Date
}

// Order status enum
export type OrderStatus =
  | "IDLE"
  | "CONFIGURING"
  | "AD_LOCKED"
  | "AD_WATCHING"
  | "AD_VERIFYING"
  | "AD_VERIFIED"
  | "ORDER_SUBMITTABLE"
  | "ORDER_SUBMITTING"
  | "ORDER_QUEUED"
  | "PROVIDER_DISPATCHED"
  | "DELIVERED"
  | "FAILED"
  | "FALLBACK_RETRY"

// Order types
export interface IOrder {
  _id: Types.ObjectId
  requestId: string // Client-generated UUID
  trackingId?: string // Guest order tracking ID (e.g., BF-A1B2C3D4)
  isGuest: boolean
  userId?: Types.ObjectId // Optional for guest orders
  serviceId: Types.ObjectId
  platformId: Types.ObjectId
  targetUrl: string
  quantity: number
  status: OrderStatus
  providerId?: Types.ObjectId
  providerServiceId?: Types.ObjectId
  providerOrderId?: string
  providerResponse?: Record<string, unknown>
  rewardToken?: string
  startedAt?: Date
  completedAt?: Date
  failedAt?: Date
  failureReason?: string
  retryCount: number
  latencyMs?: number
  ip: string
  deviceFingerprint?: string
  createdAt: Date
  updatedAt: Date
}

// Ad Reward types
export interface IAdReward {
  _id: Types.ObjectId
  rewardToken: string
  userId?: Types.ObjectId // Optional for guest rewards
  sessionId: string
  serviceId: Types.ObjectId
  ip: string
  deviceFingerprint?: string
  requestId: string
  isUsed: boolean
  usedAt?: Date
  expiresAt: Date
  createdAt: Date
}

// Rate Limit types
export interface IRateLimit {
  _id: Types.ObjectId
  key: string // ip:userId or userId
  endpoint: string
  count: number
  windowStart: Date
  windowEnd: Date
  createdAt: Date
}

// Fraud Log types
export interface IFraudLog {
  _id: Types.ObjectId
  userId?: Types.ObjectId
  ip: string
  deviceFingerprint?: string
  reason: string
  severity: "low" | "medium" | "high" | "critical"
  metadata: Record<string, unknown>
  createdAt: Date
}

// System Log types
export interface ISystemLog {
  _id: Types.ObjectId
  level: "info" | "warn" | "error" | "debug"
  category: string
  message: string
  metadata: Record<string, unknown>
  userId?: Types.ObjectId
  orderId?: Types.ObjectId
  createdAt: Date
}

// Settings types
export interface ISettings {
  _id: Types.ObjectId
  key: string
  value: unknown
  description: string
  updatedBy: Types.ObjectId
  updatedAt: Date
}

// Quantity Unlock types
export interface IQuantityUnlock {
  _id: Types.ObjectId
  identifier: string
  platformSlug: string
  currentLevel: number
  levelUnlockedAt: Date
  nextUnlockAt: Date | null
  totalOrders: number
  createdAt: Date
  updatedAt: Date
}

// Ad Verification types
export interface IAdVerification {
  _id: Types.ObjectId
  verificationId: string
  identifier: string
  platformSlug: string
  ip: string
  isUsed: boolean
  usedAt?: Date
  orderId?: Types.ObjectId
  expiresAt: Date
  createdAt: Date
}

// Quantity unlock level config
export interface QuantityLevel {
  level: number
  maxQuantity: number
  unlockAfterHours: number
}

export const QUANTITY_LEVELS: QuantityLevel[] = [
  { level: 1, maxQuantity: 300, unlockAfterHours: 0 },
  { level: 2, maxQuantity: 500, unlockAfterHours: 3 },
  { level: 3, maxQuantity: 1000, unlockAfterHours: 3 },
]

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Order submission payload
export interface OrderSubmissionPayload {
  requestId: string
  serviceId: string
  targetUrl: string
  quantity: number
  rewardToken: string
}

// Provider dispatch result
export interface ProviderDispatchResult {
  success: boolean
  providerId: string
  externalOrderId?: string
  rawResponse?: Record<string, unknown>
  error?: string
  latencyMs: number
}
