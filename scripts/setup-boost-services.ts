import mongoose from "mongoose"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const MONGODB_URI = process.env.MONGODB_URI || ""

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined")
  process.exit(1)
}

// Schemas
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

const Platform = mongoose.model("Platform", PlatformSchema)
const Service = mongoose.model("Service", ServiceSchema)
const Provider = mongoose.model("Provider", ProviderSchema)
const ProviderService = mongoose.model("ProviderService", ProviderServiceSchema)

async function setup() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("Connected successfully\n")

    // 1. Ensure platforms exist
    console.log("=== PLATFORMS ===")
    const platformData = [
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
    ]

    const platforms: any[] = []
    for (const p of platformData) {
      const existing = await Platform.findOne({ slug: p.slug })
      if (existing) {
        console.log(`  ✓ ${p.name} platform exists (${existing._id})`)
        platforms.push(existing)
      } else {
        const created = await Platform.create(p)
        console.log(`  + ${p.name} platform created (${created._id})`)
        platforms.push(created)
      }
    }

    // 2. Ensure services exist
    console.log("\n=== SERVICES ===")
    const serviceData = [
      {
        platformSlug: "instagram",
        name: "Instagram Views",
        description: "Get views on your Instagram Reels",
        minQuantity: 100,
        maxQuantity: 1000,
        pricePerUnit: 0,
        isFreeTier: true,
        dailyFreeLimit: 5,
        sortOrder: 1,
      },
      {
        platformSlug: "tiktok",
        name: "TikTok Views",
        description: "Get views on your TikTok videos",
        minQuantity: 100,
        maxQuantity: 1000,
        pricePerUnit: 0,
        isFreeTier: true,
        dailyFreeLimit: 5,
        sortOrder: 1,
      },
    ]

    const services: any[] = []
    for (const s of serviceData) {
      const platform = platforms.find((p) => p.slug === s.platformSlug)
      if (!platform) continue

      const existing = await Service.findOne({
        platformId: platform._id,
        name: s.name,
      })
      if (existing) {
        console.log(`  ✓ ${s.name} exists (${existing._id})`)
        services.push(existing)
      } else {
        const created = await Service.create({
          ...s,
          platformId: platform._id,
        })
        console.log(`  + ${s.name} created (${created._id})`)
        services.push(created)
      }
    }

    // 3. Find or create smmlite provider
    console.log("\n=== PROVIDERS ===")
    let provider = await Provider.findOne({ name: /smmlite/i })
    if (!provider) {
      provider = await Provider.create({
        name: "Smmlite",
        apiUrl: "https://smmlite.com/api/v2",
        apiKey: "REPLACE_WITH_YOUR_KEY",
        isActive: true,
        priority: 10,
        timeoutMs: 15000,
        maxRetries: 2,
        metadata: { type: "smm-panel", compatible: "perfect-panel" },
      })
      console.log(`  + Smmlite provider created (${provider._id})`)
    } else {
      console.log(`  ✓ Smmlite provider exists (${provider._id})`)
    }

    // 4. Create provider-service mappings
    console.log("\n=== PROVIDER-SERVICE MAPPINGS ===")
    for (const service of services) {
      const existing = await ProviderService.findOne({
        providerId: provider._id,
        serviceId: service._id,
      })
      if (existing) {
        console.log(`  ✓ ${service.name} → Smmlite mapping exists (ext: ${existing.externalServiceId})`)
      } else {
        const created = await ProviderService.create({
          providerId: provider._id,
          serviceId: service._id,
          externalServiceId: `smmlite-${service.name.toLowerCase().replace(/\s+/g, "-")}`,
          costPerUnit: 0,
          isActive: true,
          priority: 10,
          minQuantity: service.minQuantity,
          maxQuantity: service.maxQuantity,
        })
        console.log(`  + ${service.name} → Smmlite mapping created (ext: ${created.externalServiceId})`)
      }
    }

    console.log("\n✅ Setup complete!")
    console.log("\nNext steps:")
    console.log("1. Update Smmlite API key in Admin → Providers")
    console.log("2. Update Provider Service external IDs to match smmlite.com service IDs")
    console.log("3. Test balance check in Admin → Providers")
  } catch (error) {
    console.error("Setup error:", error)
  } finally {
    await mongoose.disconnect()
    console.log("\nDisconnected from MongoDB")
  }
}

setup()
