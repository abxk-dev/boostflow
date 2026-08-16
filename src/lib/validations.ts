import { z } from "zod"

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Order schemas
export const orderSubmissionSchema = z.object({
  requestId: z.string().uuid("Invalid request ID"),
  serviceId: z.string().min(1, "Service is required"),
  targetUrl: z.string().url("Invalid URL").min(1, "URL is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  rewardToken: z.string().min(1, "Reward token is required"),
})

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  serviceId: z.string().optional(),
})

// Service schemas
export const serviceCreateSchema = z.object({
  platformId: z.string().min(1, "Platform is required"),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required").max(1000),
  minQuantity: z.number().int().min(1),
  maxQuantity: z.number().int().min(1),
  pricePerUnit: z.number().min(0),
  isFreeTier: z.boolean().default(false),
  dailyFreeLimit: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

// Platform schemas
export const platformCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  icon: z.string().min(1, "Icon is required"),
  urlPattern: z.string().min(1, "URL pattern is required"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

// Provider schemas
export const providerCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  apiUrl: z.string().url("Invalid API URL"),
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().optional(),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(0),
  timeoutMs: z.number().int().min(1000).max(60000).default(10000),
  maxRetries: z.number().int().min(0).max(5).default(2),
})

// Provider Service schemas
export const providerServiceCreateSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  serviceId: z.string().min(1, "Service is required"),
  externalServiceId: z.string().min(1, "External service ID is required"),
  costPerUnit: z.number().min(0),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(0),
  minQuantity: z.number().int().min(1),
  maxQuantity: z.number().int().min(1),
})

// Ad reward schemas
export const adRewardClaimSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  sessionId: z.string().min(1, "Session ID is required"),
  requestId: z.string().uuid("Invalid request ID"),
})

// URL validation by platform
export const urlPatterns: Record<string, RegExp> = {
  instagram: /^https?:\/\/(www\.)?instagram\.com\/(p|reel|stories|tv)\/[a-zA-Z0-9_-]+/,
  tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
  youtube: /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]+/,
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/,
  facebook: /^https?:\/\/(www\.)?facebook\.com\/.+/,
}

export function validateUrlForPlatform(url: string, platformSlug: string): boolean {
  const pattern = urlPatterns[platformSlug]
  if (!pattern) return true // No pattern = allow all
  return pattern.test(url)
}

// Admin schemas
export const adminSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
  description: z.string().min(1),
})
