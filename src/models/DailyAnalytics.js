import mongoose from "mongoose";

const dailyAnalyticsSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  menuViews: { type: Number, default: 0 },
  itemClicks: { type: Number, default: 0 },
  addToCart: { type: Number, default: 0 },
  orders:       { type: Number, default: 0 },
  missedOrders: { type: Number, default: 0 },
  // { [itemId]: { name: string, clicks: number } }
  topItems: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, expires: 2592000 }, // 30-day TTL
});

dailyAnalyticsSchema.index({ restaurantId: 1, date: 1 }, { unique: true });

export default mongoose.models.DailyAnalytics ||
  mongoose.model("DailyAnalytics", dailyAnalyticsSchema);
