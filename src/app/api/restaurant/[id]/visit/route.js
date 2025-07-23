import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";

export async function POST(request, { params }) {
  try {
    await connectToDB();
    const { id } = params;
    await Restaurant.findByIdAndUpdate(id, { $inc: { visits: 1 } });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}