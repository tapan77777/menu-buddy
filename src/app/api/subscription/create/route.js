// src/app/api/subscription/create/route.js - CREATE THIS FILE
import { connectToDB } from "@/lib/db";
import Plan from "@/models/Plan";
import Restaurant from "@/models/resturant";
import { NextResponse } from "next/server";
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    await connectToDB();
    
    const { restaurantId, planId } = await request.json();
    
    const restaurant = await Restaurant.findById(restaurantId);
    const plan = await Plan.findById(planId);
    
    if (!restaurant || !plan) {
      return NextResponse.json(
        { success: false, error: 'Restaurant or plan not found' },
        { status: 404 }
      );
    }
    
    // Calculate total amount (plan price * duration)
    const totalAmount = plan.price * plan.durationMonths;
    
    if (totalAmount === 0) {
      // Handle freemium plan
      return await activateFreemiumPlan(restaurant, plan);
    }
    
    // Create Razorpay order for paid plans
    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `sub_${restaurant._id}_${Date.now()}`,
      notes: {
        restaurantId: restaurant._id.toString(),
        planId: plan._id.toString(),
        planName: plan.name,
        duration: plan.durationMonths
      }
    });
    
    return NextResponse.json({
      success: true,
      order: order,
      planDetails: {
        name: plan.name,
        duration: plan.durationMonths,
        monthlyPrice: plan.price,
        totalAmount: totalAmount,
        savings: plan.originalPrice ? (plan.originalPrice - plan.price) * plan.durationMonths : 0
      }
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Helper function for freemium activation
async function activateFreemiumPlan(restaurant, plan) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 10); // 10 years for freemium
  
  restaurant.currentPlan = {
    planId: plan._id,
    name: 'freemium',
    startDate: startDate,
    endDate: endDate,
    status: 'active',
    autoRenew: false
  };
  
  await restaurant.save();
  
  return NextResponse.json({
    success: true,
    message: 'Freemium plan activated',
    subscription: restaurant.currentPlan
  });
}