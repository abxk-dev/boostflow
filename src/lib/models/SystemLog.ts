import mongoose, { Schema, Model } from "mongoose"
import { ISystemLog } from "@/types"

const SystemLogSchema = new Schema<ISystemLog>(
  {
    level: {
      type: String,
      enum: ["info", "warn", "error", "debug"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  {
    timestamps: true,
  }
)

SystemLogSchema.index({ level: 1 })
SystemLogSchema.index({ category: 1 })
SystemLogSchema.index({ createdAt: -1 })

const SystemLog: Model<ISystemLog> =
  mongoose.models.SystemLog || mongoose.model<ISystemLog>("SystemLog", SystemLogSchema)

export default SystemLog
