import mongoose, { Schema, Model } from "mongoose"
import { IPlatform } from "@/types"

const PlatformSchema = new Schema<IPlatform>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
    urlPattern: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

PlatformSchema.index({ slug: 1 }, { unique: true })
PlatformSchema.index({ isActive: 1, sortOrder: 1 })

const Platform: Model<IPlatform> =
  mongoose.models.Platform || mongoose.model<IPlatform>("Platform", PlatformSchema)

export default Platform
