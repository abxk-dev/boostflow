import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const MONGODB_URI = process.env.MONGODB_URI!

async function diagnose() {
  console.log("=== BoostFlow Order Flow Diagnostics ===\n")

  await mongoose.connect(MONGODB_URI)
  console.log("✓ Connected to MongoDB\n")

  // Check platforms
  const platforms = await mongoose.connection.db!.collection("platforms").find({}).toArray()
  console.log(`Platforms: ${platforms.length}`)
  platforms.forEach((p) => console.log(`  - ${p.name} (${p.slug}) active=${p.isActive} _id=${p._id}`))

  // Check services
  const services = await mongoose.connection.db!.collection("services").find({}).toArray()
  console.log(`\nServices: ${services.length}`)
  services.forEach((s) =>
    console.log(`  - ${s.name} platform=${s.platformId} active=${s.isActive} min=${s.minQuantity} max=${s.maxQuantity} _id=${s._id}`)
  )

  // Check providers
  const providers = await mongoose.connection.db!.collection("providers").find({}).toArray()
  console.log(`\nProviders: ${providers.length}`)
  providers.forEach((p) =>
    console.log(`  - ${p.name} apiUrl=${p.apiUrl} active=${p.isActive} key=${p.apiKey?.slice(0, 20)}... _id=${p._id}`)
  )

  // Check provider services
  const providerServices = await mongoose.connection.db!.collection("providerservices").find({}).toArray()
  console.log(`\nProvider Services: ${providerServices.length}`)
  providerServices.forEach((ps) =>
    console.log(`  - service=${ps.serviceId} provider=${ps.providerId} externalId=${ps.externalServiceId} cost=${ps.costPerUnit} active=${ps.isActive} min=${ps.minQuantity} max=${ps.maxQuantity} _id=${ps._id}`)
  )

  // Check orders
  const orders = await mongoose.connection.db!.collection("orders").find({}).sort({ createdAt: -1 }).limit(10).toArray()
  console.log(`\nRecent Orders: ${orders.length}`)
  orders.forEach((o) =>
    console.log(`  - tracking=${o.trackingId} service=${o.serviceId} status=${o.status} provider=${o.providerId || 'NONE'} providerOrderId=${o.providerOrderId || 'NONE'} qty=${o.quantity} createdAt=${o.createdAt}`)
  )

  // Check ad verifications
  const adVerifications = await mongoose.connection.db!.collection("adverifications").find({}).sort({ createdAt: -1 }).limit(5).toArray()
  console.log(`\nRecent Ad Verifications: ${adVerifications.length}`)
  adVerifications.forEach((av) =>
    console.log(`  - verificationId=${av.verificationId?.slice(0, 20)}... used=${av.isUsed} platform=${av.platformSlug} expires=${av.expiresAt}`)
  )

  // Check system logs for errors
  const errorLogs = await mongoose.connection.db!.collection("systemlogs").find({ level: "error" }).sort({ createdAt: -1 }).limit(10).toArray()
  console.log(`\nRecent Error Logs: ${errorLogs.length}`)
  errorLogs.forEach((l) =>
    console.log(`  - [${l.category}] ${l.message} ${JSON.stringify(l.metadata || {})} ${l.createdAt}`)
  )

  // Cross-check: for each service, does a provider service exist?
  console.log("\n=== Service → Provider Mapping Check ===")
  for (const s of services) {
    const ps = providerServices.filter((p) => p.serviceId?.toString() === s._id?.toString())
    if (ps.length === 0) {
      console.log(`  ✗ Service "${s.name}" (${s._id}) has NO provider service mapping!`)
    } else {
      ps.forEach((p) => {
        const prov = providers.find((pr) => pr._id?.toString() === p.providerId?.toString())
        console.log(`  ✓ Service "${s.name}" → Provider "${prov?.name || 'UNKNOWN'}" extId=${p.externalServiceId} active=${p.isActive}`)
      })
    }
  }

  await mongoose.disconnect()
  console.log("\n=== Done ===")
}

diagnose().catch(console.error)
