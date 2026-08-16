import mongoose, { Schema, Model } from "mongoose"
import { IService } from "@/types"

const ServiceSchema = new Schema<IService>(
  {
    platformId: {
      type: Schema.Types.ObjectId,
      ref: "Platform",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    minQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    maxQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    isFreeTier: {
      type: Boolean,
      default: false,
    },
    dailyFreeLimit: {
      type: Number,
      default: 0,
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

ServiceSchema.index({ platformId: 1, isActive: 1 })
ServiceSchema.index({ isActive: 1, sortOrder: 1 })

const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema)

export default Service
