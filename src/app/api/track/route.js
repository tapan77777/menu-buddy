import { connectToDB } from "@/lib/db";
import Analytics from "@/models/analytics";

export async function POST(req) {
  try {
    await connectToDB();
    const { restaurantId, itemId, type } = await req.json();

    if (!restaurantId || !type) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // Set time to start of day for daily tracking
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert: update count or insert if not exists
    await Analytics.updateOne(
      {
        restaurantId,
        itemId: itemId || null,
        type,
        date: today, // ✅ now a Date object, not string
      },
      {
        $inc: { count: 1 },
        $setOnInsert: { date: today },
      },
      { upsert: true }
    );

    return Response.json({ success: true });

  } catch (err) {
    console.error("Tracking Error:", err);
    return Response.json({ error: "Tracking failed" }, { status: 500 });
  }
}
