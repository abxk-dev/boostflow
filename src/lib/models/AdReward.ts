import mongoose, { Schema, Model } from "mongoose"
import { IAdReward } from "@/types"

const AdRewardSchema = new Schema<IAdReward>(
  {
    rewardToken: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: String,
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    deviceFingerprint: {
      type: String,
    },
    requestId: {
      type: String,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },
  },
  {
    timestamps: true,
  }
)

// Required indexes
AdRewardSchema.index({ rewardToken: 1 }, { unique: true })
AdRewardSchema.index({ userId: 1, serviceId: 1 })
AdRewardSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const AdReward: Model<IAdReward> =
  mongoose.models.AdReward || mongoose.model<IAdReward>("AdReward", AdRewardSchema)

export default AdReward
