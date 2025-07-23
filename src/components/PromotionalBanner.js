'use client'
export default function PromotionalBanner({ promo }) {
  if (!promo) return null;

  return (
    <section className="w-full relative overflow-hidden rounded-none mx-0 my-2 shadow-lg sm:rounded-lg sm:mx-2">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600">
        {/* Food pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-8 text-6xl">🌿</div>
          <div className="absolute bottom-6 left-8 text-4xl">🍽️</div>
          <div className="absolute top-1/2 right-1/4 text-5xl opacity-60">🥘</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-4">
        {/* Header Section */}
        {/* <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-1 leading-tight">
            It's been raining deliciousness!
          </h2>
          <p className="text-sm text-green-100">
            Time to order again from {promo?.title || 'your favorite restaurants'}
          </p>
        </div> */}

        {/* Offer Card */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-full transform translate-x-8 -translate-y-8"></div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-xs text-gray-600 uppercase tracking-wide">Discover</span>
              </div>
              <div className="text-3xl font-black text-gray-900 leading-none mb-1">
                 Menus Instantly 🍽️  
<span className="text-lg"> </span>
              </div>
              <div className="text-xs text-gray-500">
                Browse restaurant: <span className="font-bold text-orange-600"> menus near you — fast, simple, and in real-time.
</span>
              </div>
            </div>
            
            {/* Food illustration area */}
            <div className="flex-shrink-0 text-right">
              <div className="text-4xl mb-1">🥟</div>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors " href='restaurantGrid'>
                {promo?.buttonText || 'Order Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Restaurant Offers Horizontal Scroll */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            🔥 <span>Hot Deals from Restaurants</span>
          </h3>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { name: "Pizza Palace", offer: "🕒 Open till 11 PM", time: "25 mins", discount: "50%",image: "/default-restaurant.jpg"},
              { name: "Burger King", offer: "Free Delivery", time: "20 mins", discount: "₹100 OFF",image: "/default-restaurant.jpg" },
              { name: "Chai Corner", offer: "Combo Deal", time: "15 mins", discount: "40%" ,image: "/default-restaurant.jpg"},
              { name: "Biryani House", offer: "Weekend Special", time: "30 mins", discount: "₹150 OFF",image: "/default-restaurant.jpg" },
              { name: "Dosa Point", offer: "South Special", time: "18 mins", discount: "35%",image: "/default-restaurant.jpg" }
            ].map((restaurant, i) => (
              <div key={i} className="flex-shrink-0 w-36 bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="w-full h-16 rounded-lg mb-2 overflow-hidden">
                  <img 
          src={restaurant.image}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/default-restaurant.jpg'; // Fallback
          }}
        />
                </div>
                <h4 className="font-semibold text-xs text-gray-800 mb-1 truncate">{restaurant.name}</h4>
                <p className="text-xs text-gray-600 mb-1">{restaurant.offer}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{restaurant.time}</span>
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full font-bold text-xs">
                    {restaurant.discount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
          <div className="flex items-center gap-2 text-xs text-green-100">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span>Powered by PANCHAYAT</span>
          </div>
          <div className="text-xs text-green-200">
            50+ Restaurants • ⭐ 4.3
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
