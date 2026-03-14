import Razorpay from "razorpay";
import { verifyToken } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";
import { NextResponse } from "next/server";

// Plan definitions — single source of truth
export const PLANS = {
  basic: { name: "Basic", amount: 59900,  dailyLimit: 200,      label: "₹599/month" },
  pro:   { name: "Pro",   amount: 99900,  dailyLimit: Infinity, label: "₹999/month" },
};

export async function POST(req) {
  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const decoded = verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const restaurant = await Restaurant.findById(decoded.id)
      .select("name email plan")
      .lean();

    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    // ── Validate requested plan ───────────────────────────────────────────────
    const { plan } = await req.json();
    const planConfig = PLANS[plan];

    if (!planConfig) {
      return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 });
    }

    if (restaurant.plan === plan) {
      return NextResponse.json({ success: false, error: "Already on this plan" }, { status: 400 });
    }

    // ── Create Razorpay order ─────────────────────────────────────────────────
    const razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount:   planConfig.amount,   // in paise
      currency: "INR",
      // Razorpay receipt must be ≤ 40 characters
      receipt: `mb_${plan}_${Date.now()}`,
      notes: {
        restaurantId: decoded.id,
        restaurantName: restaurant.name,
        plan,
      },
    });

    return NextResponse.json({
      success: true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      prefill: {
        name:  restaurant.name,
        email: restaurant.email,
      },
      plan,
      planLabel: planConfig.label,
    });

  } catch (err) {
    console.error("PAYMENT CREATE-ORDER ERROR:", err);
    return NextResponse.json({ success: false, error: "Payment initiation failed" }, { status: 500 });
  }
}
