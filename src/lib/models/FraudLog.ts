import mongoose, { Schema, Model } from "mongoose"
import { IFraudLog } from "@/types"

const FraudLogSchema = new Schema<IFraudLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    ip: {
      type: String,
      required: true,
    },
    deviceFingerprint: {
      type: String,
    },
    reason: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
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

FraudLogSchema.index({ ip: 1 })
FraudLogSchema.index({ userId: 1 })
FraudLogSchema.index({ severity: 1 })
FraudLogSchema.index({ createdAt: -1 })

const FraudLog: Model<IFraudLog> =
  mongoose.models.FraudLog || mongoose.model<IFraudLog>("FraudLog", FraudLogSchema)

export default FraudLog
