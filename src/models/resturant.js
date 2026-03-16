// models/restaurant.js - UPDATE YOUR EXISTING FILE
import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  slug: { type: String, unique: true },

  subdomain: {
    type: String,
    unique: true,
    sparse: true,
  },

  address: String,
  city: { type: String, default: null },
  latitude:  { type: Number, default: null },
  longitude: { type: Number, default: null },

  // GeoJSON Point — used for MongoDB 2dsphere geospatial queries.
  // Populated automatically when latitude/longitude are saved via the
  // pre-save hook below. Do NOT set this field manually.
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]  ← GeoJSON order
      default: undefined,
    },
  },

  logoUrl: String,

  // ── Subscription plan (enforced) ──────────────────────────────
  plan: {
    type: String,
    enum: ["free", "basic", "pro"],
    default: "free",
  },
  dailyOrderLimit: { type: Number, default: 30 },
  planStart: Date,
  planEnd: Date,

  // ── Daily order counters (reset each day) ─────────────────────
  ordersToday:       { type: Number, default: 0 },
  missedOrdersToday: { type: Number, default: 0 },
  lastOrderReset:    { type: String, default: null }, // "YYYY-MM-DD"

  // ── Legacy billing fields (Razorpay / history) ────────────────
  currentPlan: {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    name: { type: String, default: 'freemium' }, // freemium, basic, pro, gold
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'trial', 'suspended'],
      default: 'trial'
    },
    autoRenew: { type: Boolean, default: true },
  },
  
  // Payment tracking
  subscriptionHistory: [{
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    planName: String,
    startDate: Date,
    endDate: Date,
    amount: Number,
    paymentId: String,
    status: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Current usage tracking
  usage: {
    itemCount: { type: Number, default: 0 },
    menuCategoriesCount: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Payment info
  razorpayCustomerId: String,
  razorpaySubscriptionId: String,
  
  // Keep your existing razorpayPaymentId for backward compatibility
  razorpayPaymentId: String,

  // Custom menu categories per restaurant
  categories: [{
    name: { type: String, required: true },
    emoji: { type: String, default: '🍽️' },
    order: { type: Number, default: 0 },
  }],
}, { timestamps: true });



// ── Geospatial index (sparse so restaurants without coords are unaffected) ──
RestaurantSchema.index({ location: "2dsphere" }, { sparse: true });

// ── Keep GeoJSON location in sync with flat lat/lng fields ─────────────────
RestaurantSchema.pre("save", function (next) {
  if (this.latitude != null && this.longitude != null) {
    this.location = { type: "Point", coordinates: [this.longitude, this.latitude] };
  } else {
    this.location = undefined;
  }
  next();
});

// Add methods
RestaurantSchema.methods.isSubscriptionActive = function() {
  return this.currentPlan.status === 'active' ||
         (this.currentPlan.status === 'trial' && new Date() < this.currentPlan.endDate);
};

RestaurantSchema.methods.isWithinLimit = function(limitType, currentPlan) {
  if (!currentPlan) return false;
  
  switch(limitType) {
    case 'items':
      return !currentPlan.itemLimit || this.usage.itemCount < currentPlan.itemLimit;
    default:
      return true;
  }
};

// Virtual for days remaining
RestaurantSchema.virtual('daysRemaining').get(function() {
  if (!this.currentPlan.endDate) return 0;
  const now = new Date();
  const endDate = new Date(this.currentPlan.endDate);
  const diffTime = endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

export default mongoose.models.Restaurant || mongoose.model("Restaurant", RestaurantSchema);