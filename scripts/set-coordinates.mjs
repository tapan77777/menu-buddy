/**
 * One-time script — sets exact latitude/longitude coordinates for specific
 * restaurants and syncs the GeoJSON `location` field (mirrors the pre-save
 * hook in models/resturant.js).
 *
 * Usage (from project root):
 *   node scripts/set-coordinates.mjs
 */

import { config } from "dotenv";
import mongoose   from "mongoose";
import { resolve } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ──────────────────────────────────────────────────────────
const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set in .env.local");
  process.exit(1);
}

// ── Coordinates to apply ─────────────────────────────────────────────────────
// GeoJSON stores coordinates as [longitude, latitude] — this matches the
// pre-save hook:  coordinates: [this.longitude, this.latitude]
const UPDATES = [
  {
    name:      "Kakaa Cafe",
    latitude:  22.26142419506731,
    longitude: 84.90123336042055,
  },
  {
    name:      "Lha Kitchen",
    latitude:  28.561648516101418,
    longitude: 77.19402409588966,
  },
  {
    name:      "Bhansaghar",
    latitude:  28.560856647679355,
    longitude: 77.19351832287457,
  },
  {
    name:      "HINOKI - Slow Bar",
    latitude:  28.560430171584283,
    longitude: 77.19482332472543,
  },
  {
    name:      "Kathmandu Grill",
    latitude:  28.561131147285966,
    longitude: 77.1938269535613,
  },
];

// ── Minimal schema — strict:false preserves all other existing fields ────────
const RestaurantSchema = new mongoose.Schema({
  name:      String,
  latitude:  Number,
  longitude: Number,
  location: {
    type:        { type: String, enum: ["Point"] },
    coordinates: [Number],
  },
}, { strict: false, timestamps: true });

const Restaurant =
  mongoose.models.Restaurant ||
  mongoose.model("Restaurant", RestaurantSchema);

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log("🔌  Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI, { dbName: "menuBuddy" });
  console.log("✅  Connected.\n");

  let updated = 0;
  let notFound = 0;

  for (const entry of UPDATES) {
    process.stdout.write(`  📍  ${entry.name}  …  `);

    // Check the restaurant exists first
    const existing = await Restaurant.findOne({ name: entry.name })
      .select("_id name latitude longitude")
      .lean();

    if (!existing) {
      console.log("❌  not found in database");
      notFound++;
      continue;
    }

    // Apply the update — mirrors exactly what the pre-save hook does:
    //   if (this.latitude != null && this.longitude != null) {
    //     this.location = { type: "Point", coordinates: [this.longitude, this.latitude] };
    //   }
    const result = await Restaurant.updateOne(
      { _id: existing._id },
      {
        $set: {
          latitude:  entry.latitude,
          longitude: entry.longitude,
          location: {
            type:        "Point",
            coordinates: [entry.longitude, entry.latitude],  // GeoJSON: [lng, lat]
          },
        },
      }
    );

    if (result.modifiedCount === 1) {
      console.log(
        `✅  (${entry.latitude.toFixed(6)}, ${entry.longitude.toFixed(6)})  →  location synced`
      );
      updated++;
    } else {
      console.log("⚠️   matched but not modified (already up to date?)");
    }
  }

  console.log("\n──────────────────────────────────────");
  console.log(`✅  Updated  : ${updated}`);
  console.log(`❌  Not found: ${notFound}`);
  console.log("──────────────────────────────────────");

  // Ensure the 2dsphere index exists
  try {
    await Restaurant.collection.createIndex(
      { location: "2dsphere" },
      { sparse: true }
    );
    console.log("🗂️   2dsphere index confirmed.");
  } catch (e) {
    console.warn("⚠️   Could not verify index:", e.message);
  }

  await mongoose.disconnect();
  console.log("\n🔌  Disconnected. Done.");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
