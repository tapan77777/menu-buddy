export default function PromotionalBanner({ promo }) {
  if (!promo) return null;

  return (
    <div className="bg-yellow-400 py-4 px-6 w-screen -mx-4 sm:mx-0 mb-4 sm:rounded-xl shadow text-center sm:text-left">
      <div className="flex flex-col sm:flex-row justify-between items-center max-w-4xl mx-auto">
        <div className="mb-2 sm:mb-0">
          <h3 className="text-xl font-bold text-gray-800">{promo.title}</h3>
          <p className="text-sm text-gray-600">{promo.description}</p>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-gray-800 mb-4">
          {promo.buttonText}
        </button>
      </div>
      {/* Promotional Offers Banner */}
<div className="mb-6 bg-yellow-100 p-4 rounded-xl shadow-md">
  <h2 className="text-xl font-bold mb-2 text-center text-black">🔥 Top Offers from Restaurants</h2>
  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
    {/* Example static promos – Replace with dynamic if needed */}
    <div className="flex-shrink-0 w-64 bg-white rounded-lg p-3 shadow-sm text-black">
      <h3 className="font-semibold text-lg mb-1">Coming soon...</h3>
      <p className="text-sm text-gray-600">Valid till tonight</p>
    </div>
    <div className="flex-shrink-0 w-64 bg-white rounded-lg p-3 shadow-sm text-black">
      <h3 className="font-semibold text-lg mb-1">Coming soon...</h3>
      <p className="text-sm text-gray-600">First 100 orders only</p>
    </div>
    <div className="flex-shrink-0 w-64 bg-white rounded-lg p-3 shadow-sm text-black">
      <h3 className="font-semibold text-lg mb-1">Coming soon...</h3>
      <p className="text-sm text-gray-600">Try new Tandoori wrap</p>
    </div>
  </div>
</div>

    </div>

    
  );
}
