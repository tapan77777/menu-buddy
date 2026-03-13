import { connectToDB } from "@/lib/db";
import MenuItem from "@/models/menuItem";
import Restaurant from "@/models/resturant";

export async function GET(_, context) {
  try {
    const { slug } = context.params;
    
    await connectToDB();
    
    const restaurant = await Restaurant.findOne({ slug });
    if (!restaurant) {
      return Response.json({ error: "Restaurant not found" }, { status: 404 });
    }
    
    const items = await MenuItem.find({ restaurantId: restaurant._id });
    
    const categories = restaurant.categories && restaurant.categories.length > 0
      ? [...restaurant.categories].sort((a, b) => a.order - b.order)
      : [
          { _id: 'veg',     name: 'veg',      emoji: '🥗', order: 0 },
          { _id: 'non-veg', name: 'non-veg',  emoji: '🍗', order: 1 },
          { _id: 'drinks',  name: 'drinks',   emoji: '🥤', order: 2 },
          { _id: 'special', name: 'special',  emoji: '⭐', order: 3 },
          { _id: 'starters',name: 'starters', emoji: '🍢', order: 4 },
        ];

    return Response.json({
      success: true,
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        address: restaurant.address,
        logoUrl: restaurant.logoUrl,
        subdomain: restaurant.subdomain || restaurant.slug,
        categories,
      },
      items,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}