// src/app/api/subscription/verify/route.js - CREATE THIS FILE
import { connectToDB } from "@/lib/db";
import Plan from "@/models/Plan";
import Restaurant from "@/models/resturant";
import crypto from 'crypto';
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDB();
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      restaurantId,
      planId 
    } = await request.json();
    
    // Verify Razorpay signature
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    const plan = await Plan.findById(planId);
    
    if (!restaurant || !plan) {
      return NextResponse.json(
        { success: false, error: 'Restaurant or plan not found' },
        { status: 404 }
      );
    }
    
    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);
    
    // Update restaurant subscription
    restaurant.currentPlan = {
      planId: plan._id,
      name: plan.slug.split('-')[0], // basic, pro, gold
      startDate: startDate,
      endDate: endDate,
      status: 'active',
      autoRenew: true
    };
    
    // Add to subscription history
    restaurant.subscriptionHistory.push({
      planId: plan._id,
      planName: plan.name,
      startDate: startDate,
      endDate: endDate,
      amount: plan.price * plan.durationMonths,
      paymentId: razorpay_payment_id,
      status: 'completed'
    });
    
    await restaurant.save();
    
    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: restaurant.currentPlan
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}