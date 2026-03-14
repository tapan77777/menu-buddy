"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Zap, Crown, Shield } from "lucide-react";

// ── Plan definitions (mirrors backend) ────────────────────────────────────────
const PLANS = [
  {
    key:        "free",
    name:       "Free",
    price:      0,
    priceLabel: "₹0/month",
    limit:      30,
    limitLabel: "30 orders/day",
    icon:       Shield,
    color:      "gray",
    features:   ["30 orders per day", "Digital QR menu", "Order management", "Basic analytics"],
  },
  {
    key:        "basic",
    name:       "Basic",
    price:      599,
    priceLabel: "₹599/month",
    limit:      200,
    limitLabel: "200 orders/day",
    icon:       Zap,
    color:      "blue",
    features:   ["200 orders per day", "Everything in Free", "Full analytics", "Priority support"],
    recommended: false,
  },
  {
    key:        "pro",
    name:       "Pro",
    price:      999,
    priceLabel: "₹999/month",
    limit:      null,
    limitLabel: "Unlimited orders",
    icon:       Crown,
    color:      "orange",
    features:   ["Unlimited orders", "Everything in Basic", "Advanced analytics", "Missed orders insights", "Priority support"],
    recommended: true,
  },
];

const COLOR_MAP = {
  gray:   { badge: "bg-gray-100 text-gray-600",   ring: "ring-gray-200",   btn: "bg-gray-800 hover:bg-gray-700",   icon: "text-gray-500", header: "bg-gray-50"   },
  blue:   { badge: "bg-blue-100 text-blue-700",   ring: "ring-blue-400",   btn: "bg-blue-600 hover:bg-blue-500",   icon: "text-blue-500", header: "bg-blue-50"   },
  orange: { badge: "bg-orange-100 text-orange-700", ring: "ring-orange-400", btn: "bg-orange-500 hover:bg-orange-400", icon: "text-orange-500", header: "bg-orange-50" },
};

// ── Load Razorpay script once ─────────────────────────────────────────────────
function useRazorpay() {
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || document.querySelector('script[src*="checkout.razorpay"]')) {
      loaded.current = true;
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.head.appendChild(s);
    loaded.current = true;
  }, []);
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  if (!msg) return null;
  return (
    <div
      className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {type === "success" ? "✅" : "❌"} {msg}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [upgrading,  setUpgrading]  = useState(null); // plan key being processed
  const [toast,      setToast]      = useState(null);

  useRazorpay();

  // ── Fetch restaurant + plan data ───────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setRestaurant(res.admin);
      })
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
  }

  // ── Razorpay checkout flow ─────────────────────────────────────────────────
  async function handleUpgrade(planKey) {
    if (upgrading) return;
    setUpgrading(planKey);

    try {
      // 1. Create Razorpay order on backend
      const res  = await fetch("/api/payment/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();

      if (!data.success) {
        showToast(data.error || "Could not initiate payment", "error");
        setUpgrading(null);
        return;
      }

      // 2. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        "MenuBuddy",
        description: `Upgrade to ${data.planLabel}`,
        order_id:    data.orderId,
        prefill:     data.prefill,
        theme:       { color: "#F97316" },

        // 3. On success — verify with backend
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                plan: planKey,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Update local state immediately
              setRestaurant((prev) => ({
                ...prev,
                plan:            verifyData.plan,
                dailyOrderLimit: verifyData.dailyLimit === Infinity ? 999999 : verifyData.dailyLimit,
                planEnd:         verifyData.planEnd,
              }));
              showToast(`Successfully upgraded to ${verifyData.planLabel}! 🎉`, "success");
            } else {
              showToast("Payment received but verification failed. Contact support.", "error");
            }
          } finally {
            setUpgrading(null);
          }
        },

        modal: {
          ondismiss: () => setUpgrading(null),
        },
      });

      rzp.on("payment.failed", (resp) => {
        showToast(`Payment failed: ${resp.error.description}`, "error");
        setUpgrading(null);
      });

      rzp.open();

    } catch {
      showToast("Something went wrong. Please try again.", "error");
      setUpgrading(null);
    }
  }

  // ── Derived state ──────────────────────────────────────────────────────────
  const currentPlanKey   = restaurant?.plan ?? "free";
  const ordersToday      = restaurant?.ordersToday ?? 0;
  const missedToday      = restaurant?.missedOrdersToday ?? 0;
  const dailyLimit       = restaurant?.dailyOrderLimit ?? 30;
  const effectiveLimit   = dailyLimit >= 999999 ? null : dailyLimit;
  const usagePct         = effectiveLimit ? Math.min(100, Math.round((ordersToday / effectiveLimit) * 100)) : 0;

  const planEnd = restaurant?.planEnd ? new Date(restaurant.planEnd) : null;
  const isExpired = planEnd && planEnd < new Date();
  const daysLeft  = planEnd ? Math.ceil((planEnd - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <div>
            <h1 className="text-sm font-bold text-gray-900">Plan & Billing</h1>
            <p className="text-xs text-gray-400">Manage your MenuBuddy subscription</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Current Plan Card ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Current Plan</h2>
          </div>
          <div className="px-5 py-5">
            {loading ? (
              <div className="space-y-3">
                <div className="h-5 bg-gray-100 rounded w-32 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-48 animate-pulse" />
                <div className="h-2 bg-gray-100 rounded w-full animate-pulse" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Plan name + expiry */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
                    currentPlanKey === "pro"   ? "bg-orange-100 text-orange-700" :
                    currentPlanKey === "basic" ? "bg-blue-100 text-blue-700"    :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {currentPlanKey === "pro" ? "👑" : currentPlanKey === "basic" ? "⚡" : "🛡️"}
                    {" "}{currentPlanKey.charAt(0).toUpperCase() + currentPlanKey.slice(1)} Plan
                  </span>
                  {planEnd && !isExpired && (
                    <span className="text-xs text-gray-400">
                      Renews {planEnd.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      {daysLeft !== null && daysLeft <= 7 && (
                        <span className="ml-1 text-orange-500 font-semibold">({daysLeft}d left)</span>
                      )}
                    </span>
                  )}
                  {isExpired && (
                    <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                      Expired — now on Free
                    </span>
                  )}
                </div>

                {/* Usage bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>Orders today</span>
                    <span className="font-semibold text-gray-800">
                      {ordersToday} accepted
                      {missedToday > 0 && (
                        <span className="text-red-500 ml-1">· {missedToday} missed</span>
                      )}
                      {effectiveLimit && <span className="text-gray-400"> / {effectiveLimit}</span>}
                      {!effectiveLimit && <span className="text-gray-400"> (unlimited)</span>}
                    </span>
                  </div>
                  {effectiveLimit && (
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          usagePct >= 100 ? "bg-red-500" :
                          usagePct >= 80  ? "bg-orange-400" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${usagePct}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Missed orders CTA */}
                {missedToday > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                    🚫 <span className="font-semibold">{missedToday} orders</span> were declined today due to your plan limit.
                    Upgrade to accept more orders.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Plan Cards ────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-3 px-0.5">Available Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const colors       = COLOR_MAP[plan.color];
              const isCurrent    = currentPlanKey === plan.key;
              const isDowngrade  = PLANS.findIndex(p => p.key === plan.key) < PLANS.findIndex(p => p.key === currentPlanKey);
              const isProcessing = upgrading === plan.key;
              const PlanIcon     = plan.icon;

              return (
                <div
                  key={plan.key}
                  className={`relative bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden flex flex-col ${
                    isCurrent ? `ring-2 ${colors.ring} border-transparent` : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {/* Recommended badge */}
                  {plan.recommended && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Popular
                      </span>
                    </div>
                  )}

                  {/* Card header */}
                  <div className={`${colors.header} px-5 py-5`}>
                    <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center mb-3 shadow-sm`}>
                      <PlanIcon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    <p className="text-base font-bold text-gray-900">{plan.name}</p>
                    <p className="text-2xl font-black text-gray-900 mt-0.5">
                      {plan.price === 0 ? "Free" : `₹${plan.price}`}
                      {plan.price > 0 && <span className="text-sm font-normal text-gray-400">/mo</span>}
                    </p>
                    <p className="text-xs font-semibold text-gray-500 mt-1">{plan.limitLabel}</p>
                  </div>

                  {/* Features */}
                  <div className="px-5 py-4 flex-1">
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                          <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${colors.icon}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="px-5 pb-5">
                    {isCurrent ? (
                      <div className={`w-full py-2.5 text-center text-sm font-semibold rounded-xl ${colors.badge}`}>
                        ✓ Current Plan
                      </div>
                    ) : isDowngrade ? (
                      <div className="w-full py-2.5 text-center text-xs text-gray-400 rounded-xl bg-gray-50">
                        Contact support to downgrade
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.key)}
                        disabled={!!upgrading}
                        className={`w-full py-2.5 text-sm font-bold text-white rounded-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${colors.btn}`}
                      >
                        {isProcessing ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Opening…
                          </span>
                        ) : (
                          `Upgrade to ${plan.name}`
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Billing note ──────────────────────────────────────────────── */}
        <p className="text-xs text-gray-400 text-center">
          Payments are processed securely by Razorpay. Plans are billed monthly for 30 days.
          For billing support, contact{" "}
          <a href="mailto:support@menubuddy.in" className="text-orange-500 hover:underline">
            support@menubuddy.in
          </a>
        </p>

        <div className="h-2" />
      </div>

      <Toast
        msg={toast?.msg}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
