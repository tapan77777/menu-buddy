// models/Order.ts
import { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, required: false }, // optional if you store snapshot
  name: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  notes: { type: String, required: false },
  tags: { type: [String], default: [] },
}, { _id: false });

const OrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true }, // e.g., ORDER_20251124_0001
  restaurantId: { type: Schema.Types.ObjectId, required: true, index: true },
  tableId: { type: String, required: false, index: true },
  deviceSessionId: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, required: false }, // optional if logged in
  items: { type: [OrderItemSchema], required: true, default: [] },
  totalAmount: { type: Number, required: true },
  meta: {
    paymentMethod: { type: String },
    tip: { type: Number, default: 0 },
    specialRequests: { type: String },
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "preparing", "ready", "completed", "rejected", "cancelled"],
    default: "pending",
    index: true
  },
  idempotencyKey: { type: String, required: false, index: true },
  isFlagged: { type: Boolean, default: false },
  history: [{
    status: String,
    by: String, // "admin" | "user" | deviceSessionId or adminId
    note: String,
    at: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

/**
 * Index suggestions:
 * - Fast admin queries: (restaurantId, status, createdAt)
 * - Avoid duplicates: idempotencyKey per deviceSessionId or per restaurant
 */
OrderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ deviceSessionId: 1, createdAt: -1 });

export default models.Order || model("Order", OrderSchema);
