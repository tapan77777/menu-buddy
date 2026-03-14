import { connectToDB } from "@/lib/db";
import DailyAnalytics from "@/models/DailyAnalytics";

export async function POST(req) {
  try {
    await connectToDB();
    const { restaurantId, itemId, itemName, type } = await req.json();

    if (!restaurantId || !type) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const date = new Date().toISOString().split("T")[0];

    let update = {};

    if (type === "menu_viewed" || type === "view") {
      update = { $inc: { menuViews: 1 } };
    } else if (type === "item_clicked") {
      update = { $inc: { itemClicks: 1 } };
      if (itemId && itemName) {
        update.$inc[`topItems.${itemId}.clicks`] = 1;
        update.$set = { [`topItems.${itemId}.name`]: itemName };
      }
    } else if (type === "add_to_cart") {
      update = { $inc: { addToCart: 1 } };
    } else if (type === "order_placed") {
      update = { $inc: { orders: 1 } };
    } else {
      return Response.json({ error: "Unknown type" }, { status: 400 });
    }

    await DailyAnalytics.updateOne(
      { restaurantId, date },
      update,
      { upsert: true }
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("[/api/track]", err);
    return Response.json({ error: "Tracking failed" }, { status: 500 });
  }
}
