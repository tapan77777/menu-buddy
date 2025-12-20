import {
    addAdminListener,
    removeListener
} from "@/lib/orderEvents";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("restaurantId");

  if (!restaurantId) {
    return new Response("Missing restaurantId", { status: 400 });
  }

  let controller;

  const stream = new ReadableStream({
    start(c) {
      controller = c;

      // Register admin listener
      addAdminListener(restaurantId, controller);

      // Initial handshake
      controller.enqueue(
        new TextEncoder().encode(
          `data: ${JSON.stringify({ type: "connected" })}\n\n`
        )
      );

      // Clean up on page leave
      req.signal.addEventListener("abort", () => {
        removeListener("admin", restaurantId, controller);
        try { controller.close(); } catch {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    }
  });
}
