import { connectToDB } from "@/lib/db";
import DailyAnalytics from "@/models/DailyAnalytics";

export async function POST(req) {
  try {
    await connectToDB();
    const { restaurantId, itemId, itemName } = await req.json();

    if (!restaurantId) {
      return Response.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    const date = new Date().toISOString().split("T")[0];

    const update = { $inc: { itemClicks: 1 } };

    if (itemId && itemName) {
      update.$inc[`topItems.${itemId}.clicks`] = 1;
      update.$set = { [`topItems.${itemId}.name`]: itemName };
    }

    await DailyAnalytics.updateOne(
      { restaurantId, date },
      update,
      { upsert: true }
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("[analytics/item-click]", err);
    return Response.json({ error: "Tracking failed" }, { status: 500 });
  }
}
