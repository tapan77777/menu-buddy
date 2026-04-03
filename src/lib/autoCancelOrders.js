import Order from "@/models/Order";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

/**
 * Bulk-cancels any pending orders for a restaurant that are older than 2 hours.
 * Assumes DB is already connected (caller is responsible for connectToDB).
 *
 * @param {string|ObjectId} restaurantId
 * @returns {Promise<number>} number of orders that were auto-cancelled
 */
export async function autoCancelStaleOrders(restaurantId) {
  const cutoff = new Date(Date.now() - TWO_HOURS_MS);

  const result = await Order.updateMany(
    {
      restaurantId,
      status: "pending",
      createdAt: { $lt: cutoff },
    },
    {
      $set: { status: "cancelled" },
      $push: {
        history: {
          status: "cancelled",
          note: "Auto-cancelled (no response)",
          at: new Date(),
          by: "system",
        },
      },
    }
  );

  return result.modifiedCount ?? 0;
}
