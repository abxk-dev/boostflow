import mongoose, { Schema, Model } from "mongoose"

export interface ICooldown {
  _id: mongoose.Types.ObjectId
  identifier: string // userId or guest fingerprint
  platformSlug: string // "instagram" or "tiktok"
  accountId: string // social media account ID (e.g. "username")
  contentId: string // specific post/reel/video ID
  serviceId: mongoose.Types.ObjectId
  expiresAt: Date
  createdAt: Date
}

const CooldownSchema = new Schema<ICooldown>(
  {
    identifier: {
      type: String,
      required: true,
    },
    platformSlug: {
      type: String,
      required: true,
      lowercase: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    contentId: {
      type: String,
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete after expiry
    },
  },
  {
    timestamps: true,
  }
)

// For checking same content cooldown
CooldownSchema.index(
  { identifier: 1, platformSlug: 1, contentId: 1, serviceId: 1, expiresAt: 1 },
  { name: "content_cooldown" }
)

// For checking account-level cooldown
CooldownSchema.index(
  { identifier: 1, platformSlug: 1, accountId: 1, serviceId: 1, expiresAt: 1 },
  { name: "account_cooldown" }
)

// TTL index already defined via `index: { expires: 0 }` on the expiresAt field

const Cooldown: Model<ICooldown> =
  mongoose.models.Cooldown || mongoose.model<ICooldown>("Cooldown", CooldownSchema)

export default Cooldown
