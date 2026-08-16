import mongoose, { Schema, Model } from "mongoose"
import { IUser } from "@/types"

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ipHistory: {
      type: [String],
      default: [],
    },
    deviceFingerprints: {
      type: [String],
      default: [],
    },
    dailyOrderCount: {
      type: Number,
      default: 0,
    },
    lastOrderReset: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Additional indexes (email and username unique indexes already defined in schema)
UserSchema.index({ createdAt: -1 })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
