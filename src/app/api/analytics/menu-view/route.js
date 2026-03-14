import { connectToDB } from "@/lib/db";
import DailyAnalytics from "@/models/DailyAnalytics";

export async function POST(req) {
  try {
    await connectToDB();
    const { restaurantId } = await req.json();

    if (!restaurantId) {
      return Response.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    const date = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    await DailyAnalytics.updateOne(
      { restaurantId, date },
      { $inc: { menuViews: 1 } },
      { upsert: true }
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("[analytics/menu-view]", err);
    return Response.json({ error: "Tracking failed" }, { status: 500 });
  }
}
