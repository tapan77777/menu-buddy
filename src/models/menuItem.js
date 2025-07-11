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
    enum: ["veg", "non-veg", "drinks","special","starters"],
    required: true
  },
  bestseller: {
  type: Boolean,
  default: false,
},

  imageUrl: String
}, { timestamps: true });

export default mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
