import { connectToDB } from "@/lib/db";
import { notifyAdmin } from "@/lib/orderEvents";
import Order from "@/models/Order";
import Restaurant from "@/models/resturant";
import DailyAnalytics from "@/models/DailyAnalytics";

// Daily order limits per plan
const PLAN_LIMITS = {
  free:  30,
  basic: 200,
  pro:   Infinity,
};

/**
 * Shared order creation logic used by both customer and staff (admin) endpoints.
 *
 * @param {object} params
 * @param {string} params.restaurantId
 * @param {string} [params.tableId]
 * @param {Array}  params.items           - [{ itemId, name, price, qty, notes? }]
 * @param {number} params.totalAmount
 * @param {string} params.deviceSessionId
 * @param {string} [params.idempotencyKey]
 * @param {string} [params.specialRequests]
 * @param {"customer"|"staff"} [params.orderSource="customer"]
 *
 * @returns {{ success: boolean, order?: object, error?: string, limitReached?: boolean }}
 */
export async function createOrder({
  restaurantId,
  tableId,
  items,
  totalAmount,
  deviceSessionId,
  idempotencyKey,
  specialRequests,
  orderSource = "customer",
}) {
  await connectToDB();

  if (!restaurantId || !items || items.length === 0) {
    return { success: false, error: "Invalid order" };
  }

  // ── Fetch restaurant plan & counters ──────────────────────────────────
  const restaurant = await Restaurant.findById(restaurantId)
    .select("plan dailyOrderLimit ordersToday missedOrdersToday lastOrderReset")
    .lean();

  if (!restaurant) {
    return { success: false, error: "Restaurant not found" };
  }

  const today = new Date().toISOString().split("T")[0];

  // ── Reset counters if it's a new day (atomic, runs at most once per day) ─
  let ordersToday = restaurant.ordersToday ?? 0;
  if (restaurant.lastOrderReset !== today) {
    await Restaurant.updateOne(
      { _id: restaurantId },
      { $set: { ordersToday: 0, missedOrdersToday: 0, lastOrderReset: today } }
    );
    ordersToday = 0;
  }

  // ── Check daily order limit ───────────────────────────────────────────
  const plan  = restaurant.plan ?? "free";
  const limit = restaurant.dailyOrderLimit ?? PLAN_LIMITS[plan];

  if (limit !== Infinity && ordersToday >= limit) {
    // Record missed order (fire-and-forget, non-blocking)
    Restaurant.updateOne(
      { _id: restaurantId },
      { $inc: { missedOrdersToday: 1 } }
    ).catch(() => {});

    DailyAnalytics.updateOne(
      { restaurantId, date: today },
      { $inc: { missedOrders: 1 } },
      { upsert: true }
    ).catch(() => {});

    return {
      success: false,
      limitReached: true,
      error: "Online orders are unavailable at the moment. Please order at the counter.",
    };
  }

  // ── Increment today's accepted order count ────────────────────────────
  await Restaurant.updateOne(
    { _id: restaurantId },
    { $inc: { ordersToday: 1 } }
  );

  // ── Create the order ──────────────────────────────────────────────────
  const byLabel = orderSource === "staff" ? "staff" : "customer";

  const order = await Order.create({
    orderId: "O_" + Date.now(),
    restaurantId,
    tableId,
    items,
    totalAmount,
    deviceSessionId,
    idempotencyKey,
    orderSource,
    meta: { specialRequests },
    status: "pending",
    history: [{ status: "pending", at: new Date(), by: byLabel }],
  });

  // ── Real-time notification to kitchen/admin ───────────────────────────
  notifyAdmin(restaurantId, { type: "new_order", order });

  // ── Analytics tracking (fire-and-forget) ─────────────────────────────
  DailyAnalytics.updateOne(
    { restaurantId, date: today },
    { $inc: { orders: 1 } },
    { upsert: true }
  ).catch(() => {});

  return { success: true, order };
}
