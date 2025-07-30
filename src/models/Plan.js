// models/Plan.js - CREATE NEW FILE
import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true }, // Monthly price in INR
  originalPrice: { type: Number }, // For showing discounts
  
  // Feature limits
  itemLimit: { type: Number, default: null }, // null = unlimited
  
  // Feature flags
  adminAccess: { type: Boolean, default: true },
  analytics: { type: Boolean, default: true },
  aiFeatures: { type: Boolean, default: false },
  promotionalBanner: { type: Boolean, default: false },
  
  // Plan details
  durationMonths: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  description: String,
  features: [String],
}, { timestamps: true });

export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);