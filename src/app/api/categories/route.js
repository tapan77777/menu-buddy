import { verifyToken } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";

const DEFAULT_CATEGORIES = [
  { name: 'veg', emoji: '🥗', order: 0 },
  { name: 'non-veg', emoji: '🍗', order: 1 },
  { name: 'drinks', emoji: '🥤', order: 2 },
  { name: 'special', emoji: '⭐', order: 3 },
  { name: 'starters', emoji: '🍢', order: 4 },
];

// GET — fetch categories for the logged-in restaurant
export async function GET(req) {
  const decoded = verifyToken(req);
  if (!decoded) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDB();
  const restaurant = await Restaurant.findById(decoded.id).select("categories");
  if (!restaurant) return Response.json({ error: "Restaurant not found" }, { status: 404 });

  // Seed defaults if none yet
  if (!restaurant.categories || restaurant.categories.length === 0) {
    restaurant.categories = DEFAULT_CATEGORIES;
    await restaurant.save();
  }

  const sorted = [...restaurant.categories].sort((a, b) => a.order - b.order);
  return Response.json({ success: true, categories: sorted });
}

// POST — add a new category
export async function POST(req) {
  const decoded = verifyToken(req);
  if (!decoded) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name, emoji } = await req.json();
  if (!name?.trim()) return Response.json({ error: "Name is required" }, { status: 400 });

  await connectToDB();
  const restaurant = await Restaurant.findById(decoded.id).select("categories");
  if (!restaurant) return Response.json({ error: "Restaurant not found" }, { status: 404 });

  if (!restaurant.categories || restaurant.categories.length === 0) {
    restaurant.categories = DEFAULT_CATEGORIES;
  }

  const maxOrder = restaurant.categories.reduce((m, c) => Math.max(m, c.order), -1);
  restaurant.categories.push({ name: name.trim(), emoji: emoji || '🍽️', order: maxOrder + 1 });
  await restaurant.save();

  const newCat = restaurant.categories[restaurant.categories.length - 1];
  return Response.json({ success: true, category: newCat }, { status: 201 });
}
