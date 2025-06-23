
async function getRestaurantData(slug) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/restaurant/${slug}/menu`, {
    cache: 'no-store',
  });
  return res.json();
}

export default async function RestaurantPage({ params }) {
  const { slug } = params;
  const { success, restaurant, items } = await getRestaurantData(slug);

  if (!success) {
    return (
      <div className="text-center mt-10 text-red-500">
        Restaurant not found.
      </div>
    );
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <img
          src={restaurant.logoUrl}
          alt={restaurant.name}
          className="w-28 h-28 object-cover mx-auto rounded-full shadow"
        />
        <h1 className="text-3xl font-bold mt-3">{restaurant.name}</h1>
        <p className="text-gray-600">{restaurant.address}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow-md p-4">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="text-sm text-gray-600">{item.description}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-green-700 font-bold">₹{item.price}</span>
              <span className="bg-gray-100 text-xs px-2 py-1 rounded">
                {item.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
