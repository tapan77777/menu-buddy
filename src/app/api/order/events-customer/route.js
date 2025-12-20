import { connectToDB } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return new Response("Missing orderId", { status: 400 });
  }

  let controller;

  const stream = new ReadableStream({
    async start(c) {
      controller = c;

      send({ type: "connected" });

      // Poll every 2 sec
      const interval = setInterval(async () => {
        try {
          await connectToDB();

          const order = await Order.findById(orderId);

          if (!order) return;

          send({
            type: "order_update",
            orderId: order._id,
            status: order.status,
          });
        } catch (err) {
          console.log("SSE CUSTOMER ERROR:", err.message);
        }
      }, 2000);

      // Cleanup
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    }
  });

  function send(data) {
    try {
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
      );
    } catch {
      console.log("SSE closed — stop sending");
    }
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
