import mongoose, { Schema, Model } from "mongoose"

export interface IQuantityUnlock {
  _id: mongoose.Types.ObjectId
  // Identifier: userId for logged-in users, fingerprint for guests
  identifier: string
  platformSlug: string // "instagram" or "tiktok"
  currentLevel: number // 1, 2, or 3
  levelUnlockedAt: Date // When current level was unlocked
  nextUnlockAt: Date | null // When next level becomes available
  totalOrders: number
  createdAt: Date
  updatedAt: Date
}

const QuantityUnlockSchema = new Schema<IQuantityUnlock>(
  {
    identifier: {
      type: String,
      required: true,
    },
    platformSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    currentLevel: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 3,
    },
    levelUnlockedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    nextUnlockAt: {
      type: Date,
      default: null,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// One record per user/guest per platform
QuantityUnlockSchema.index({ identifier: 1, platformSlug: 1 }, { unique: true })

const QuantityUnlock: Model<IQuantityUnlock> =
  mongoose.models.QuantityUnlock ||
  mongoose.model<IQuantityUnlock>("QuantityUnlock", QuantityUnlockSchema)

export default QuantityUnlock
