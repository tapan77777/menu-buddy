import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";

export async function GET() {
  try {
    await connectToDB();
    const restaurants = await Restaurant.find({});
    return Response.json(restaurants);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    await connectToDB();
    const body = await request.json();
    const restaurant = await Restaurant.create(body);
    return Response.json(restaurant);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

