import { connectToDB } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("restaurantId");
  const period = searchParams.get("period");
  const date = searchParams.get("date");

  let startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  let endDate = new Date();

  if (period === "custom" && date) {
    startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
  }

  const orders = await Order.find({
    restaurantId,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  let csv = "Date,Order ID,Table,Total,Status\n";

  orders.forEach(o => {
    csv += `${o.createdAt.toLocaleDateString()},${o.orderId},${o.tableId || ""},${o.totalAmount},${o.status}\n`;
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=report.csv",
    },
  });
}
