import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import * as dotenv from "dotenv"
import * as path from "path"

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const MONGODB_URI = process.env.MONGODB_URI || ""

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined")
  process.exit(1)
}

// Schemas
const UserSchema = new mongoose.Schema(
  {
    email: String,
    username: String,
    passwordHash: String,
    role: { type: String, default: "user" },
    isActive: { type: Boolean, default: true },
    ipHistory: [String],
    deviceFingerprints: [String],
    dailyOrderCount: { type: Number, default: 0 },
    lastOrderReset: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const PlatformSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    icon: String,
    urlPattern: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const ServiceSchema = new mongoose.Schema(
  {
    platformId: { type: mongoose.Schema.Types.ObjectId, ref: "Platform" },
    name: String,
    description: String,
    minQuantity: Number,
    maxQuantity: Number,
    pricePerUnit: Number,
    isFreeTier: { type: Boolean, default: false },
    dailyFreeLimit: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const ProviderSchema = new mongoose.Schema(
  {
    name: String,
    apiUrl: String,
    apiKey: String,
    apiSecret: String,
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    timeoutMs: { type: Number, default: 10000 },
    maxRetries: { type: Number, default: 2 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

const ProviderServiceSchema = new mongoose.Schema(
  {
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    externalServiceId: String,
    costPerUnit: Number,
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    minQuantity: Number,
    maxQuantity: Number,
  },
  { timestamps: true }
)

const User = mongoose.model("User", UserSchema)
const Platform = mongoose.model("Platform", PlatformSchema)
const Service = mongoose.model("Service", ServiceSchema)
const Provider = mongoose.model("Provider", ProviderSchema)
const ProviderService = mongoose.model("ProviderService", ProviderServiceSchema)

async function seed() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("Connected successfully")

    // Clear existing data
    console.log("Clearing existing data...")
    await Promise.all([
      User.deleteMany({}),
      Platform.deleteMany({}),
      Service.deleteMany({}),
      Provider.deleteMany({}),
      ProviderService.deleteMany({}),
    ])

    // Create admin user
    console.log("Creating admin user...")
    const adminPasswordHash = await bcrypt.hash("Admin123!", 12)
    const admin = await User.create({
      email: "admin@boostflow.com",
      username: "admin",
      passwordHash: adminPasswordHash,
      role: "admin",
    })
    console.log(`Admin user created: ${admin.email}`)

    // Create demo user
    console.log("Creating demo user...")
    const demoPasswordHash = await bcrypt.hash("Demo123!", 12)
    const demoUser = await User.create({
      email: "demo@boostflow.com",
      username: "demo",
      passwordHash: demoPasswordHash,
      role: "user",
    })
    console.log(`Demo user created: ${demoUser.email}`)

    // Create platforms
    console.log("Creating platforms...")
    const platforms = await Platform.insertMany([
      {
        name: "Instagram",
        slug: "instagram",
        icon: "instagram",
        urlPattern: "^https?:\\/\\/(www\\.)?instagram\\.com\\/(p|reel|stories|tv)\\/[a-zA-Z0-9_-]+",
        sortOrder: 1,
      },
      {
        name: "TikTok",
        slug: "tiktok",
        icon: "zap",
        urlPattern: "^https?:\\/\\/(www\\.)?tiktok\\.com\\/@[\\w.-]+\\/video\\/\\d+",
        sortOrder: 2,
      },
      {
        name: "YouTube",
        slug: "youtube",
        icon: "youtube",
        urlPattern: "^https?:\\/\\/(www\\.)?(youtube\\.com\\/(watch\\?v=|shorts\\/)|youtu\\.be\\/)[a-zA-Z0-9_-]+",
        sortOrder: 3,
      },
      {
        name: "Twitter/X",
        slug: "twitter",
        icon: "twitter",
        urlPattern: "^https?:\\/\\/(www\\.)?(twitter\\.com|x\\.com)\\/\\w+\\/status\\/\\d+",
        sortOrder: 4,
      },
      {
        name: "Facebook",
        slug: "facebook",
        icon: "facebook",
        urlPattern: "^https?:\\/\\/(www\\.)?facebook\\.com\\/.+",
        sortOrder: 5,
      },
    ])
    console.log(`Created ${platforms.length} platforms`)

    // Create services
    console.log("Creating services...")
    const services = await Service.insertMany([
      // Instagram services
      {
        platformId: platforms[0]._id,
        name: "Instagram Followers",
        description: "Get real followers for your Instagram profile",
        minQuantity: 100,
        maxQuantity: 10000,
        pricePerUnit: 0,
        isFreeTier: true,
        dailyFreeLimit: 3,
        sortOrder: 1,
      },
      {
        platformId: platforms[0]._id,
        name: "Instagram Likes",
        description: "Get likes on your Instagram posts",
        minQuantity: 50,
        maxQuantity: 5000,
        pricePerUnit: 0,
        isFreeTier: true,
        dailyFreeLimit: 5,
        sortOrder: 2,
      },
      {
        platformId: platforms[0]._id,
        name: "Instagram Views",
        description: "Get views on your Instagram reels and stories",
        minQuantity: 100,
        maxQuantity: 50000,
        pricePerUnit: 0,
        isFreeTier: true,
        dailyFreeLimit: 5,
        sortOrder: 3,
      },
      // TikTok services
      {
        platformId: platforms[1]._id,
        name: "TikTok Followers",
        description: "Get followers for your TikTok profile",
        minQuantity: 100,
        maxQuantity: 10000,
        pricePerUnit: 0,
        isFreeTier: true,
        dailyFreeLimit: 3,
        sortOrder: 1,
      },
      {
        platformId: platforms[1]._id,
        name: "TikTok Likes",
        description: "Get likes on your TikTok videos",
        minQuantity: 50,
        maxQuantity: 5000,
        pricePerUnit: 0,
        isFreeTier: true,
        dailyFreeLimit: 5,
        sortOrder: 2,
      },
      {
        platformId: platforms[1]._id,
        name: "TikTok Views",
        description: "Get views on your TikTok videos",
        minQuantity: 100,
        maxQuantity: 100000,
        pricePerUnit: 0,
        isFreeTier: true,
        dailyFreeLimit: 5,
        sortOrder: 3,
      },
      // YouTube services
      {
        platformId: platforms[2]._id,
        name: "YouTube Subscribers",
        description: "Get subscribers for your YouTube channel",
        minQuantity: 100,
        maxQuantity: 5000,
        pricePerUnit: 0,
        isFreeTier: true,
        dailyFreeLimit: 2,
        sortOrder: 1,
      },
      {
        platformId: platforms[2]._id,
        name: "YouTube Views",
        description: "Get views on your YouTube videos",
        minQuantity: 100,
        maxQuantity: 50000,
        pricePerUnit: 0,
        isFreeTier: true,
        dailyFreeLimit: 3,
        sortOrder: 2,
      },
      {
        platformId: platforms[2]._id,
        name: "YouTube Likes",
        description: "Get likes on your YouTube videos",
        minQuantity: 50,
        maxQuantity: 5000,
        pricePerUnit: 0,
        isFreeTier: true,
        dailyFreeLimit: 5,
        sortOrder: 3,
      },
    ])
    console.log(`Created ${services.length} services`)

    // Create providers
    console.log("Creating providers...")
    const providers = await Provider.insertMany([
      {
        name: "Provider Alpha",
        apiUrl: "https://api.provider-alpha.com/v1/order",
        apiKey: "demo-api-key-alpha",
        isActive: true,
        priority: 10,
        timeoutMs: 10000,
        maxRetries: 2,
      },
      {
        name: "Provider Beta",
        apiUrl: "https://api.provider-beta.com/v1/order",
        apiKey: "demo-api-key-beta",
        isActive: true,
        priority: 5,
        timeoutMs: 15000,
        maxRetries: 1,
      },
      {
        name: "Provider Gamma",
        apiUrl: "https://api.provider-gamma.com/v1/order",
        apiKey: "demo-api-key-gamma",
        isActive: true,
        priority: 1,
        timeoutMs: 10000,
        maxRetries: 2,
      },
    ])
    console.log(`Created ${providers.length} providers`)

    // Create provider-service mappings
    console.log("Creating provider-service mappings...")
    const providerServices = []
    for (const service of services) {
      for (const provider of providers) {
        providerServices.push({
          providerId: provider._id,
          serviceId: service._id,
          externalServiceId: `ext-${service.name.toLowerCase().replace(/\s+/g, "-")}-${provider.name.toLowerCase().replace(/\s+/g, "-")}`,
          costPerUnit: 0.001,
          isActive: true,
          priority: provider.priority,
          minQuantity: service.minQuantity,
          maxQuantity: service.maxQuantity,
        })
      }
    }
    await ProviderService.insertMany(providerServices)
    console.log(`Created ${providerServices.length} provider-service mappings`)

    console.log("\nSeed completed successfully!")
    console.log("\nDemo credentials:")
    console.log("Admin: admin@boostflow.com / Admin123!")
    console.log("User: demo@boostflow.com / Demo123!")
  } catch (error) {
    console.error("Seed error:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

seed()
