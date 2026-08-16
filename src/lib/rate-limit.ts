import { connectDB } from "./db"
import { RateLimit } from "./models"

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
}

export async function checkRateLimit(
  key: string,
  endpoint: string,
  config: Partial<RateLimitConfig> = {}
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  await connectDB()

  const { windowMs, maxRequests } = { ...defaultConfig, ...config }
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowMs)

  // Find or create rate limit entry
  let rateLimit = await RateLimit.findOne({
    key,
    endpoint,
    windowEnd: { $gt: now },
  })

  if (!rateLimit) {
    // Create new window
    rateLimit = await RateLimit.create({
      key,
      endpoint,
      count: 1,
      windowStart: now,
      windowEnd: new Date(now.getTime() + windowMs),
    })

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: rateLimit.windowEnd,
    }
  }

  if (rateLimit.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: rateLimit.windowEnd,
    }
  }

  // Increment counter
  rateLimit.count += 1
  await rateLimit.save()

  return {
    allowed: true,
    remaining: maxRequests - rateLimit.count,
    resetAt: rateLimit.windowEnd,
  }
}

export async function getRateLimitHeaders(
  key: string,
  endpoint: string,
  config: Partial<RateLimitConfig> = {}
): Promise<Record<string, string>> {
  const { allowed, remaining, resetAt } = await checkRateLimit(key, endpoint, config)

  return {
    "X-RateLimit-Limit": String(config.maxRequests || defaultConfig.maxRequests),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt.getTime() / 1000)),
    ...(allowed
      ? {}
      : { "Retry-After": String(Math.ceil((resetAt.getTime() - Date.now()) / 1000)) }),
  }
}
