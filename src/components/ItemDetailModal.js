'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function ItemDetailModal({ item, onClose, onAddToCart, showModal }) {
  const [isClosing, setIsClosing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Ensure item is valid
  const displayItem = item || {
    name: 'Unnamed Item',
    price: 0,
    originalPrice: 0,
    description: '',
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
      setIsClosing(false);
    }, 300); // Add timeout delay if animation is used
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay

    const itemWithQuantity = { ...displayItem, quantity };
    onAddToCart?.(itemWithQuantity);

    setIsLoading(false);
    setAddedToCart(true);

    setTimeout(() => {
      handleClose();
    }, 1000);
  };

  const updateQuantity = (newQuantity) => {
    if (newQuantity >= 1) setQuantity(newQuantity);
  };

  const getTotalPrice = () => {
    return displayItem.price * quantity || 0;
  };

  const getSavings = () => {
    const { originalPrice, price } = displayItem;
    return originalPrice && originalPrice > price
      ? (originalPrice - price) * quantity
      : 0;
  };

  // 🛑 Prevent body scroll when modal is shown
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [showModal]);


  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Animated Backdrop */}
      <div 
        className={`absolute inset-0 transition-all duration-300 ${
          isClosing ? 'bg-black/0' : 'bg-black/60'
        }`}
        style={{
          backdropFilter: isClosing ? 'blur(0px)' : 'blur(8px)',
        }}
      />

      {/* Modal Container */}
      <div
        className={`bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full mx-4 relative overflow-hidden shadow-2xl transform transition-all duration-300 ease-out max-h-[90vh] ${
          isClosing 
            ? 'scale-90 translate-y-8 opacity-0' 
            : 'scale-100 translate-y-0 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-all duration-200 hover:scale-110 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Image Section */}
          <div className="relative h-64 sm:h-80">
            <Image
  src={displayItem.imageUrl}
  alt={displayItem.name}
  width={800}
  height={600}
  className={`w-full h-full object-cover transition-transform duration-700 ${
    isClosing ? 'scale-110' : 'scale-100'
  }`}
/>
            
            {/* Image Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            {/* Floating Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {displayItem.bestseller && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                  🔥 Bestseller
                </div>
              )}
              {displayItem.veg !== undefined && (
                <div className={`px-3 py-1 rounded-full text-sm font-bold shadow-lg ${
                  displayItem.veg 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {displayItem.veg ? '🌱 Veg' : '🍗 Non-Veg'}
                </div>
              )}
            </div>

            {/* Rating Badge */}
            {displayItem.rating && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                <span className="text-yellow-500">⭐</span>
                <span className="font-bold text-gray-800">{displayItem.rating}</span>
                {displayItem.reviews && (
                  <span className="text-gray-600 text-sm">({displayItem.reviews})</span>
                )}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {displayItem.name}
              </h3>
              {displayItem.category && (
                <p className="text-green-600 dark:text-green-400 font-medium text-sm">
                  {displayItem.category}
                </p>
              )}
            </div>

            {/* Description */}
            {displayItem.description && (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {displayItem.description}
              </p>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              {displayItem.cookingTime && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 text-center">
                  <div className="text-2xl mb-1">⏱️</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cooking Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{displayItem.cookingTime}</p>
                </div>
              )}
              {displayItem.reviews && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 text-center">
                  <div className="text-2xl mb-1">👥</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reviews</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{displayItem.reviews}</p>
                </div>
              )}
            </div>

            {/* Ingredients */}
            {displayItem.ingredients && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Ingredients:</h4>
                <div className="flex flex-wrap gap-2">
                  {displayItem.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Section */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₹{displayItem.price}
                  </span>
                  {displayItem.originalPrice && displayItem.originalPrice > displayItem.price && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ₹{displayItem.originalPrice}
                      </span>
                      <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                        {Math.round(((displayItem.originalPrice - displayItem.price) / displayItem.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(quantity - 1)}
                      className="w-10 h-10 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-green-300 hover:text-green-500 transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <span className="w-12 text-center font-bold text-xl text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(quantity + 1)}
                      className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    ₹{getTotalPrice()}
                  </p>
                  {getSavings() > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Save ₹{getSavings()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-gray-800 p-6 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Close
          </button>
          
          <button
            onClick={handleAddToCart}
            disabled={isLoading || addedToCart}
            className={`flex-2 py-3 px-6 rounded-2xl font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              addedToCart
                ? 'bg-green-500 text-white'
                : isLoading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:scale-105 active:scale-95'
            }`}
          >
            {addedToCart ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Added to Cart!
              </>
            ) : isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5L7 18" />
                </svg>
                Add to Cart - ₹{getTotalPrice()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}