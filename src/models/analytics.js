import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId }, // optional
  type: { type: String, enum: ["view", "item_clicked"], required: true },
  date: {
  type: Date,
  default: Date.now,
  expires: 60 * 60 * 24 * 30, // 30 days in seconds
}
, // ✅ ADD THIS LINE
  count: { type: Number, default: 0 },    // ✅ ADD THIS IF NOT EXISTING
});

// Optional: index for faster querying
analyticsSchema.index({ restaurantId: 1, itemId: 1, type: 1, date: 1 }, { unique: true });

export default mongoose.models.Analytics || mongoose.model("Analytics", analyticsSchema);

