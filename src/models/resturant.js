import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  slug: { type: String, unique: true },
  address: String,
  logoUrl: String,
  visits: { type: Number, default: 0 }, // Add this field
}, { timestamps: true });

export default mongoose.models.Restaurant || mongoose.model("Restaurant", RestaurantSchema);
