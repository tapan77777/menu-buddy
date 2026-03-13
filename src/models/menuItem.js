import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },
  name: { type: String, required: true },
  description: String,
  price: Number,
  category: {
    type: String,
    required: true,
  },
  bestseller: {
  type: Boolean,
  default: false,
},

  imageUrl: String
}, { timestamps: true });

// In development, Next.js hot-module-replacement re-evaluates this file but
// mongoose.models persists across reloads. Delete the cached model so the
// updated schema (e.g. removed enum) is always picked up without a server restart.
if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.MenuItem;
}

export default mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
