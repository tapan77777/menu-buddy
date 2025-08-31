// models/restaurant.js - UPDATE YOUR EXISTING FILE
import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  slug: { type: String, unique: true },
  
  // ✅ ADD THIS LINE - Add subdomain field right after slug
  subdomain: { 
    type: String, 
    unique: true, 
    sparse: true // Allows null values while maintaining uniqueness for existing restaurants
  },
  
  address: String,
  logoUrl: String,
  
  // ✅ Enhanced subscription fields (replace your existing plan fields)
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
}, { timestamps: true });



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