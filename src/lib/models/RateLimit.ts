import mongoose, { Schema, Model } from "mongoose"
import { IRateLimit } from "@/types"

const RateLimitSchema = new Schema<IRateLimit>(
  {
    key: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
      default: 1,
    },
    windowStart: {
      type: Date,
      required: true,
    },
    windowEnd: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },
  },
  {
    timestamps: true,
  }
)

RateLimitSchema.index({ key: 1, endpoint: 1 })

const RateLimit: Model<IRateLimit> =
  mongoose.models.RateLimit || mongoose.model<IRateLimit>("RateLimit", RateLimitSchema)

export default RateLimit
