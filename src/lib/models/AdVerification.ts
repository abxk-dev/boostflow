import mongoose, { Schema, Model } from "mongoose"

export interface IAdVerification {
  _id: mongoose.Types.ObjectId
  verificationId: string // Unique token returned to client
  identifier: string // userId or fingerprint
  platformSlug: string // "instagram" or "tiktok"
  ip: string
  isUsed: boolean
  usedAt?: Date
  orderId?: mongoose.Types.ObjectId
  expiresAt: Date
  createdAt: Date
}

const AdVerificationSchema = new Schema<IAdVerification>(
  {
    verificationId: {
      type: String,
      required: true,
      unique: true,
    },
    identifier: {
      type: String,
      required: true,
    },
    platformSlug: {
      type: String,
      required: true,
      lowercase: true,
    },
    ip: {
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
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
)

AdVerificationSchema.index({ verificationId: 1 }, { unique: true })
AdVerificationSchema.index({ identifier: 1, platformSlug: 1, isUsed: 1 })
AdVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const AdVerification: Model<IAdVerification> =
  mongoose.models.AdVerification ||
  mongoose.model<IAdVerification>("AdVerification", AdVerificationSchema)

export default AdVerification
