import mongoose, { Schema, Model } from "mongoose"
import { IOrder, OrderStatus } from "@/types"

const ORDER_STATUSES: OrderStatus[] = [
  "IDLE",
  "CONFIGURING",
  "AD_LOCKED",
  "AD_WATCHING",
  "AD_VERIFYING",
  "AD_VERIFIED",
  "ORDER_SUBMITTABLE",
  "ORDER_SUBMITTING",
  "ORDER_QUEUED",
  "PROVIDER_DISPATCHED",
  "DELIVERED",
  "FAILED",
  "FALLBACK_RETRY",
]

const OrderSchema = new Schema<IOrder>(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
    },
    trackingId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    platformId: {
      type: Schema.Types.ObjectId,
      ref: "Platform",
      required: true,
    },
    targetUrl: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "IDLE",
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
    },
    providerServiceId: {
      type: Schema.Types.ObjectId,
      ref: "ProviderService",
    },
    providerOrderId: {
      type: String,
    },
    providerResponse: {
      type: Schema.Types.Mixed,
    },
    rewardToken: {
      type: String,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
    },
    ip: {
      type: String,
      required: true,
    },
    deviceFingerprint: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Required indexes
OrderSchema.index({ requestId: 1 }, { unique: true })
OrderSchema.index({ trackingId: 1 }, { unique: true, sparse: true })
OrderSchema.index({ userId: 1, createdAt: -1 }, { sparse: true })
OrderSchema.index({ status: 1 })
OrderSchema.index({ createdAt: -1 })

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)

export default Order
