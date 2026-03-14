import crypto from "crypto";
import { verifyToken } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";
import { NextResponse } from "next/server";
import { PLANS } from "../create-order/route";

export async function POST(req) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const decoded = verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return NextResponse.json({ success: false, error: "Missing payment fields" }, { status: 400 });
    }

    const planConfig = PLANS[plan];
    if (!planConfig) {
      return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 });
    }

    // ── Verify Razorpay HMAC signature ────────────────────────────────────────
    // Razorpay signs: razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Razorpay signature mismatch");
      return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
    }

    // ── Upgrade plan in DB ────────────────────────────────────────────────────
    await connectToDB();

    const now     = new Date();
    const planEnd = new Date(now);
    planEnd.setDate(planEnd.getDate() + 30); // 30-day subscription

    const dailyOrderLimit = planConfig.dailyLimit === Infinity ? 999999 : planConfig.dailyLimit;

    await Restaurant.updateOne(
      { _id: decoded.id },
      {
        $set: {
          plan:            plan,
          dailyOrderLimit: dailyOrderLimit,
          planStart:       now,
          planEnd:         planEnd,
          // Legacy currentPlan fields (backward compat)
          "currentPlan.name":      plan,
          "currentPlan.status":    "active",
          "currentPlan.startDate": now,
          "currentPlan.endDate":   planEnd,
          razorpayPaymentId: razorpay_payment_id,
        },
        $push: {
          subscriptionHistory: {
            planName:  planConfig.name,
            startDate: now,
            endDate:   planEnd,
            amount:    planConfig.amount / 100, // store in rupees
            paymentId: razorpay_payment_id,
            status:    "active",
            createdAt: now,
          },
        },
      }
    );

    return NextResponse.json({
      success: true,
      plan,
      planLabel:   planConfig.label,
      planEnd:     planEnd.toISOString(),
      dailyLimit:  planConfig.dailyLimit,
    });

  } catch (err) {
    console.error("PAYMENT VERIFY ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
