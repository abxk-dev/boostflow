// SMM Panel API Integration (Perfect Panel compatible)
// Docs: https://smmlite.com/api

interface SMMConfig {
  apiUrl: string
  apiKey: string
}

interface SMMService {
  service: number
  name: string
  type: string
  category: string
  rate: string
  min: string
  max: string
  refill: boolean
  cancel: boolean
}

interface SMMOrderResponse {
  order: number
  error?: string
}

interface SMMStatusResponse {
  charge: string
  start_count: string
  status: string
  remains: string
  currency: string
  error?: string
}

interface SMMBalanceResponse {
  balance: string
  currency: string
  error?: string
}

type SMMRefillResponse = {
  refill: string
  error?: string
}

type OrderStatus =
  | "Pending"
  | "In progress"
  | "Processing"
  | "Completed"
  | "Partial"
  | "Canceled"
  | "Failed"

export class SMMPanel {
  private config: SMMConfig

  constructor(config: SMMConfig) {
    this.config = config
  }

  private async request<T>(params: Record<string, string>): Promise<T> {
    const formData = new URLSearchParams({
      key: this.config.apiKey,
      ...params,
    })

    try {
      const response = await fetch(this.config.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      })

      if (!response.ok) {
        throw new Error(`SMM API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      console.error("SMM Panel request failed:", error)
      throw error
    }
  }

  /**
   * Get list of available services
   */
  async getServices(): Promise<SMMService[]> {
    return this.request<SMMService[]>({ action: "services" })
  }

  /**
   * Add a new order
   * @param serviceId - Service ID from getServices()
   * @param link - URL to the social media post/profile
   * @param quantity - Number of engagements (views, likes, etc.)
   */
  async addOrder(serviceId: number, link: string, quantity: number): Promise<SMMOrderResponse> {
    return this.request<SMMOrderResponse>({
      action: "add",
      service: serviceId.toString(),
      link,
      quantity: quantity.toString(),
    })
  }

  /**
   * Add order with custom comments
   * @param serviceId - Service ID
   * @param link - URL to the post
   * @param comments - Array of comments (one per line)
   */
  async addCommentOrder(
    serviceId: number,
    link: string,
    comments: string[]
  ): Promise<SMMOrderResponse> {
    return this.request<SMMOrderResponse>({
      action: "add",
      service: serviceId.toString(),
      link,
      comments: comments.join("\n"),
    })
  }

  /**
   * Add subscription order
   * @param serviceId - Service ID
   * @param username - Username to subscribe to
   * @param min - Minimum quantity per post
   * @param max - Maximum quantity per post
   * @param delay - Delay in minutes (0, 5, 10, 15, 20, 30, 40, 50, 60, 90, 120, 150, 180, 210, 240, 270, 300, 360, 420, 480, 540, 600)
   * @param posts - Limit number of new posts (optional)
   * @param oldPosts - Number of existing posts to process (optional)
   */
  async addSubscription(
    serviceId: number,
    username: string,
    min: number,
    max: number,
    delay: number,
    posts?: number,
    oldPosts?: number
  ): Promise<SMMOrderResponse> {
    const params: Record<string, string> = {
      action: "add",
      service: serviceId.toString(),
      username,
      min: min.toString(),
      max: max.toString(),
      delay: delay.toString(),
    }

    if (posts !== undefined) params.posts = posts.toString()
    if (oldPosts !== undefined) params.old_posts = oldPosts.toString()

    return this.request<SMMOrderResponse>(params)
  }

  /**
   * Check status of a single order
   * @param orderId - Order ID returned from addOrder()
   */
  async getOrderStatus(orderId: number): Promise<SMMStatusResponse> {
    return this.request<SMMStatusResponse>({
      action: "status",
      order: orderId.toString(),
    })
  }

  /**
   * Check status of multiple orders (up to 100)
   * @param orderIds - Array of order IDs
   */
  async getMultipleOrderStatus(orderIds: number[]): Promise<Record<string, SMMStatusResponse>> {
    return this.request<Record<string, SMMStatusResponse>>({
      action: "status",
      orders: orderIds.join(","),
    })
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<SMMBalanceResponse> {
    return this.request<SMMBalanceResponse>({ action: "balance" })
  }

  /**
   * Request refill for an order
   * @param orderId - Order ID to refill
   */
  async requestRefill(orderId: number): Promise<SMMRefillResponse> {
    return this.request<SMMRefillResponse>({
      action: "refill",
      order: orderId.toString(),
    })
  }

  /**
   * Map SMM panel status to our internal status
   */
  static mapStatus(smmStatus: string): string {
    const statusMap: Record<string, string> = {
      Pending: "ORDER_QUEUED",
      "In progress": "IN_PROGRESS",
      Processing: "PROCESSING",
      Completed: "COMPLETED",
      Partial: "PARTIAL",
      Canceled: "CANCELLED",
      Failed: "FAILED",
    }

    return statusMap[smmStatus] || "UNKNOWN"
  }

  /**
   * Map our internal status to SMM panel status
   */
  static reverseMapStatus(internalStatus: string): string {
    const statusMap: Record<string, string> = {
      ORDER_QUEUED: "Pending",
      IN_PROGRESS: "In progress",
      PROCESSING: "Processing",
      COMPLETED: "Completed",
      PARTIAL: "Partial",
      CANCELLED: "Canceled",
      FAILED: "Failed",
    }

    return statusMap[internalStatus] || "Pending"
  }
}

// Singleton instance (will be configured with API key from admin)
let smmInstance: SMMPanel | null = null

export function getSMMPanel(): SMMPanel {
  if (!smmInstance) {
    const apiKey = process.env.SMM_PANEL_API_KEY
    const apiUrl = process.env.SMM_PANEL_API_URL || "https://smmlite.com/api/v2"

    if (!apiKey) {
      throw new Error("SMM_PANEL_API_KEY environment variable is not set")
    }

    smmInstance = new SMMPanel({ apiUrl, apiKey })
  }

  return smmInstance
}

// For admin configuration (runtime)
export function configureSMMPanel(apiKey: string, apiUrl?: string): SMMPanel {
  smmInstance = new SMMPanel({
    apiUrl: apiUrl || "https://smmlite.com/api/v2",
    apiKey,
  })
  return smmInstance
}

export type { SMMService, SMMOrderResponse, SMMStatusResponse, SMMBalanceResponse, OrderStatus }
