import crypto from "crypto";
import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";
import { NextResponse } from "next/server";
import { PLANS } from "../create-order/route";

// Add RAZORPAY_WEBHOOK_SECRET to your .env.local
// Set this in the Razorpay dashboard under Settings → Webhooks

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
    }

    // ── Verify webhook signature ──────────────────────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Webhook signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // ── Handle payment.captured ───────────────────────────────────────────────
    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      if (!payment) return NextResponse.json({ received: true });

      const { restaurantId, plan } = payment.notes ?? {};
      if (!restaurantId || !plan) return NextResponse.json({ received: true });

      const planConfig = PLANS[plan];
      if (!planConfig) return NextResponse.json({ received: true });

      await connectToDB();

      const now     = new Date();
      const planEnd = new Date(now);
      planEnd.setDate(planEnd.getDate() + 30);

      const dailyOrderLimit = planConfig.dailyLimit === Infinity ? 999999 : planConfig.dailyLimit;

      // Idempotency: only upgrade if payment ID hasn't been applied already
      const already = await Restaurant.exists({
        _id: restaurantId,
        razorpayPaymentId: payment.id,
      });

      if (!already) {
        await Restaurant.updateOne(
          { _id: restaurantId },
          {
            $set: {
              plan:            plan,
              dailyOrderLimit: dailyOrderLimit,
              planStart:       now,
              planEnd:         planEnd,
              "currentPlan.name":      plan,
              "currentPlan.status":    "active",
              "currentPlan.startDate": now,
              "currentPlan.endDate":   planEnd,
              razorpayPaymentId: payment.id,
            },
            $push: {
              subscriptionHistory: {
                planName:  planConfig.name,
                startDate: now,
                endDate:   planEnd,
                amount:    payment.amount / 100,
                paymentId: payment.id,
                status:    "active",
                createdAt: now,
              },
            },
          }
        );
        console.log(`[Webhook] Upgraded restaurant ${restaurantId} to ${plan}`);
      }
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
