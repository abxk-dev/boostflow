import mongoose, { Schema, Model } from "mongoose"
import { IProvider } from "@/types"

const ProviderSchema = new Schema<IProvider>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    apiUrl: {
      type: String,
      required: true,
    },
    apiKey: {
      type: String,
      required: true,
    },
    apiSecret: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    timeoutMs: {
      type: Number,
      default: 10000,
    },
    maxRetries: {
      type: Number,
      default: 2,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

ProviderSchema.index({ isActive: 1, priority: -1 })

const Provider: Model<IProvider> =
  mongoose.models.Provider || mongoose.model<IProvider>("Provider", ProviderSchema)

export default Provider
