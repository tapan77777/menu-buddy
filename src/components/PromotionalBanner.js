export default function PromotionalBanner({ promo }) {
  if (!promo) return null;

  return (
<section className="relative w-screen -mx-4 sm:mx-0 py-6 shadow-md mb-8 rounded-none sm:rounded-b-3xl bg-yellow-400">
 
      {/* 📸 Panchayat-style background image */}
      {/* <img
        src="/images/panchayat-banner.jpg"
        alt="Chai Samosa Panchayat Promo"
        className="absolute inset-0 w-full h-full object-cover opacity-50 z-0"
      /> */}

      {/* Floating Decorative Blobs */}
       <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-2xl animate-ping-slow z-0" />
      <div className="absolute top-4 right-4 w-32 h-32 bg-orange-300/30 rounded-full blur-2xl animate-float-slow z-0" /> 

      {/* Main Foreground Content */}
       <div className="relative z-10 max-w-6xl mx-auto text-center sm:text-left flex flex-col items-center sm:items-start gap-4"> 
        {/* Floating Food Icons */}
         {/* <div className="flex items-center gap-6">
          <img
            src="/images/samosa.png"
            alt="Samosa"
            className="w-16 h-16 object-contain animate-float"
          />
          <img
            src="/images/chai.png"
            alt="Chai"
            className="w-14 h-14 object-contain animate-float-slow"
          />
        </div>  */}

       
         <h2 className="text-2xl sm:text-3xl font-extrabold text-yellow-900 drop-shadow-md">
          ☕ {promo.title}
        </h2>
        <p className="text-sm sm:text-base text-gray-800">{promo.description}</p>

        {/* CTA Button */}
         <button className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition shadow-lg">
          {promo.buttonText}
        </button>
      </div> 

      {/* Horizontal Offers */}
      <div className="relative z-10 mt-6 bg-red p-4 rounded-xl shadow-inner">
        <h3 className="text-lg font-bold mb-2 text-black text-center sm:text-left">🔥 Top Offers from Restaurants</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
              <h4 className="text-md font-semibold mb-1">Coming soon...</h4>
              <p className="text-sm text-gray-600">Exciting deals await 🍔</p>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Footer */}
      <div className="relative z-10 mt-6 text-center text-xs text-gray-600 italic">
        Powered by <span className="font-bold text-red-700">PANCHAYAT</span> on <span className="font-bold text-orange-500">Amazon Prime</span>
      </div>
    </section>
  );
}
