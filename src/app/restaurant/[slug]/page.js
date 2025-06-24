import Image from "next/image";

async function getRestaurantData(slug) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/restaurant/${slug}/menu`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function RestaurantPage({ params }) {
  const slug = params.slug; // ✅ FIXED LINE

  const { success, restaurant, items } = await getRestaurantData(slug);

  if (!success) {
    return (
      <div className="p-8 text-center text-red-600">
        <h1 className="text-3xl font-bold">Restaurant not found</h1>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="text-center mb-10">
        {restaurant.logoUrl && (
          <Image
            src={restaurant.logoUrl}
            alt={restaurant.name}
            width={100}
            height={100}
            className="mx-auto rounded-full mb-4"
          />
        )}
        <h1 className="text-4xl font-bold text-gray-800">{restaurant.name}</h1>
        <p className="text-gray-500">{restaurant.address}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow p-4 hover:shadow-md transition">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="text-gray-600 text-sm">{item.description}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-green-600 font-bold">₹{item.price}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                {item.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
