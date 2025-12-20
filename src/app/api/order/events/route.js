import { connectToDB } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return new Response("restaurantId missing", { status: 400 });
    }

    // Create readable stream for SSE
    const stream = new ReadableStream({
      start(controller) {
        console.log("SSE connected for restaurant:", restaurantId);

        // Send initial message
        controller.enqueue(encode(`connected`));

        // Poll DB every second (lightweight)
        const interval = setInterval(async () => {
          const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });
          controller.enqueue(encode(JSON.stringify(orders)));
        }, 1000);

        return () => clearInterval(interval);
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      }
    });
  } catch (err) {
    console.log("SSE error:", err);
    return new Response("SSE error", { status: 500 });
  }
}

function encode(data) {
  return new TextEncoder().encode(`data: ${data}\n\n`);
}
