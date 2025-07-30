// lib/subscriptionService.js - CREATE NEW FILE
import Restaurant from '@/models/resturant.js';

export const SubscriptionService = {
  // Check if restaurant can perform an action
  async canPerformAction(restaurantId, action) {
    try {
      const restaurant = await Restaurant.findById(restaurantId).populate('currentPlan.planId');
      
      if (!restaurant.isSubscriptionActive()) {
        return { allowed: false, reason: 'Subscription expired' };
      }
      
      const plan = restaurant.currentPlan.planId;
      
      switch(action) {
        case 'add_item':
          const canAdd = restaurant.isWithinLimit('items', plan);
          return {
            allowed: canAdd,
            reason: canAdd ? null : `Item limit of ${plan?.itemLimit} reached. Please upgrade your plan.`,
            currentUsage: restaurant.usage.itemCount,
            limit: plan?.itemLimit
          };
        
        case 'use_ai_features':
          return {
            allowed: plan?.aiFeatures || false,
            reason: plan?.aiFeatures ? null : 'AI features not available in your plan. Upgrade to Gold plan.'
          };
          
        case 'use_promotional_banner':
          return {
            allowed: plan?.promotionalBanner || false,
            reason: plan?.promotionalBanner ? null : 'Promotional banners not available in your plan. Upgrade to Gold plan.'
          };
          
        default:
          return { allowed: true };
      }
    } catch (error) {
      console.error('Error checking subscription permissions:', error);
      return { allowed: false, reason: 'Error checking permissions' };
    }
  },

  // Update usage when actions are performed
  async updateUsage(restaurantId, usageType, increment = 1) {
    try {
      const updateField = {};
      updateField[`usage.${usageType}Count`] = increment;
      updateField['usage.lastUpdated'] = new Date();
      
      await Restaurant.findByIdAndUpdate(
        restaurantId,
        { $inc: updateField },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating usage:', error);
    }
  },

  // Get restaurant's current plan details
  async getCurrentPlan(restaurantId) {
    try {
      const restaurant = await Restaurant.findById(restaurantId).populate('currentPlan.planId');
      return {
        plan: restaurant.currentPlan,
        usage: restaurant.usage,
        daysRemaining: restaurant.daysRemaining,
        isActive: restaurant.isSubscriptionActive()
      };
    } catch (error) {
      console.error('Error getting current plan:', error);
      return null;
    }
  }
};