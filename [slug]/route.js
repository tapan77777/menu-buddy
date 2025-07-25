import { connectToDB } from "@/lib/db";
import MenuItem from "@/models/menuItem";
import Restaurant from "@/models/resturant";



export async function GET(_, context) {
  try {
    const { slug } = await context.params; // Await is needed in Next.js 15+

    await connectToDB();

    const restaurant = await Restaurant.findOne({ slug });
    if (!restaurant) {
      return Response.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const items = await MenuItem.find({ restaurantId: restaurant._id });

    return Response.json({
      success: true,
      restaurant: {
        name: restaurant.name,
        address: restaurant.address,
        logoUrl: restaurant.logoUrl,
      },
      items,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}
