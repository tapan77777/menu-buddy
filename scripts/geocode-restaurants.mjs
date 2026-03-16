/**
 * One-time backfill script — geocodes all restaurants that are missing
 * latitude / longitude coordinates.
 *
 * Usage (from the project root):
 *   node scripts/geocode-restaurants.mjs
 *
 * The script reads MONGODB_URI from .env.local automatically.
 * A 1-second delay between requests respects Nominatim's rate-limit policy.
 */

import { config } from "dotenv";
import mongoose   from "mongoose";
import { resolve } from "path";
import { fileURLToPath } from "url";

// ── Load environment variables from .env.local ──────────────────────────────
const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set in .env.local");
  process.exit(1);
}

// ── Minimal Restaurant schema (only fields needed for geocoding) ────────────
// We define a lean schema here so the script has no dependency on Next.js
// path aliases (@/) or the full application model.
const RestaurantSchema = new mongoose.Schema({
  name:      String,
  address:   String,
  city:      String,
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

// ── Nominatim geocoder (inline — no @/ alias needed in scripts) ─────────────
async function geocodeAddress(query) {
  if (!query?.trim()) return null;
  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(query.trim())}&format=json&limit=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":      "MenuBuddy/1.0 (contact@menubuddy.co.in)",
        "Accept-Language": "en",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    return isNaN(lat) || isNaN(lng) ? null : { lat, lng };
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log("🔌  Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI, { dbName: "menuBuddy" });
  console.log("✅  Connected.\n");

  // Find restaurants that are missing either coordinate
  const targets = await Restaurant.find({
    $or: [
      { latitude:  { $exists: false } },
      { latitude:  null },
      { longitude: { $exists: false } },
      { longitude: null },
    ],
  }).select("_id name address city latitude longitude").lean();

  if (targets.length === 0) {
    console.log("🎉  All restaurants already have coordinates. Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  console.log(`📍  Found ${targets.length} restaurant(s) without coordinates.\n`);

  let success = 0;
  let failed  = 0;

  for (const r of targets) {
    const query = [r.name, r.city, r.address].filter(Boolean).join(", ");
    process.stdout.write(`  ⏳  ${r.name || r._id}  →  "${query}"  …  `);

    const coords = await geocodeAddress(query);

    if (coords) {
      await Restaurant.updateOne(
        { _id: r._id },
        {
          $set: {
            latitude:  coords.lat,
            longitude: coords.lng,
            location: {
              type:        "Point",
              coordinates: [coords.lng, coords.lat],
            },
          },
        }
      );
      console.log(`✅  (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`);
      success++;
    } else {
      console.log("❌  not found");
      failed++;
    }

    // Respect Nominatim's 1 request/second policy
    await sleep(1_100);
  }

  console.log(`\n──────────────────────────────────────`);
  console.log(`✅  Geocoded : ${success}`);
  console.log(`❌  Not found: ${failed}`);
  console.log(`──────────────────────────────────────`);

  // Ensure the 2dsphere index exists after populating coordinates
  try {
    await Restaurant.collection.createIndex({ location: "2dsphere" }, { sparse: true });
    console.log("🗂️   2dsphere index confirmed.");
  } catch (e) {
    console.warn("⚠️   Could not create index:", e.message);
  }

  await mongoose.disconnect();
  console.log("\n🔌  Disconnected. Done.");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
