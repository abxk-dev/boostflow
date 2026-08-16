import mongoose, { Schema, Model } from "mongoose"
import { IProviderService } from "@/types"

const ProviderServiceSchema = new Schema<IProviderService>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    externalServiceId: {
      type: String,
      required: true,
    },
    costPerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
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
  },
  {
    timestamps: true,
  }
)

ProviderServiceSchema.index({ serviceId: 1, isActive: 1, priority: -1 })
ProviderServiceSchema.index({ providerId: 1 })

const ProviderService: Model<IProviderService> =
  mongoose.models.ProviderService ||
  mongoose.model<IProviderService>("ProviderService", ProviderServiceSchema)

export default ProviderService
