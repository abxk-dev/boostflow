import mongoose from "mongoose"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const MONGODB_URI = process.env.MONGODB_URI || ""

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined")
  process.exit(1)
}

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

const Provider = mongoose.model("Provider", ProviderSchema)

async function addSmmlite() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("Connected successfully")

    // Check if smmlite already exists
    const existing = await Provider.findOne({ name: /smmlite/i })
    if (existing) {
      console.log("Smmlite provider already exists:", existing.name)
      await mongoose.disconnect()
      return
    }

    const provider = await Provider.create({
      name: "Smmlite",
      apiUrl: "https://smmlite.com/api/v2",
      apiKey: "YOUR_API_KEY_HERE",
      isActive: true,
      priority: 10,
      timeoutMs: 15000,
      maxRetries: 2,
      metadata: {
        type: "smm-panel",
        compatible: "perfect-panel",
      },
    })

    console.log("Smmlite provider created successfully:")
    console.log(`  ID: ${provider._id}`)
    console.log(`  Name: ${provider.name}`)
    console.log(`  API URL: ${provider.apiUrl}`)
    console.log(`  Priority: ${provider.priority}`)
    console.log("\nUpdate the API key in the admin panel after login.")
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

addSmmlite()
