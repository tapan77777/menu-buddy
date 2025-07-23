import connectToDB from "@/lib/db";
import Restaurant from "@/models/resturant";

export async function PUT(request, { params }) {
  try {
    await connectToDB();
    const { id } = params;
    const body = await request.json();
    const updated = await Restaurant.findByIdAndUpdate(id, body, { new: true });
    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDB();
    const { id } = params;
    await Restaurant.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}