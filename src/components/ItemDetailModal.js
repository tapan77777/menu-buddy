'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function ItemDetailModal({ item, onClose, onAddToCart, showModal }) {
  const [isClosing, setIsClosing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Ensure item is valid
  const displayItem = item || {
    name: 'Unnamed Item',
    price: 0,
    originalPrice: 0,
    description: '',
  };

  // Truncate description for preview
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const shouldShowReadMore = displayItem.description && displayItem.description.length > 100;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
      setIsClosing(false);
      setShowFullDescription(false);
      setImageLoaded(false);
    }, 300);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const itemWithQuantity = { ...displayItem, quantity };
    onAddToCart?.(itemWithQuantity);

    setIsLoading(false);
    setAddedToCart(true);

    setTimeout(() => {
      handleClose();
    }, 1200);
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

  const getDiscount = () => {
    const { originalPrice, price } = displayItem;
    return originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;
  };

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
      className={`fixed inset-0 z-50 flex justify-center items-end sm:items-center transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Animated Backdrop */}
      <div 
        className={`absolute inset-0 transition-all duration-300 ${
          isClosing ? 'bg-black/0' : 'bg-black/70'
        }`}
        style={{
          backdropFilter: isClosing ? 'blur(0px)' : 'blur(10px)',
        }}
      />

      {/* Modal Container - Slides up on mobile, centered on desktop */}
      <div
        className={`bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full mx-0 sm:mx-4 relative overflow-hidden shadow-2xl transform transition-all duration-500 ease-out max-h-[95vh] sm:max-h-[90vh] ${
          isClosing 
            ? 'translate-y-full sm:translate-y-0 sm:scale-90 opacity-0' 
            : 'translate-y-0 sm:scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle for Mobile */}
        <div className="sm:hidden sticky top-0 z-20 bg-white dark:bg-neutral-900 pt-2 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-11 h-11 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-80px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Image Section with Parallax Effect */}
          <div className="sticky top-0 z-10">
            <div className="relative h-56 sm:h-72 overflow-hidden">
              {/* Loading Skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
              )}
              
              <Image
                src={displayItem.imageUrl}
                alt={displayItem.name}
                width={800}
                height={600}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
                } ${isClosing ? 'scale-110' : ''}`}
                onLoad={() => setImageLoaded(true)}
                priority
              />
              
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
              
              {/* Floating Badges - Top Left */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[60%]">
                {displayItem.bestseller && (
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1 animate-pulse">
                    <span className="text-sm">🔥</span>
                    Bestseller
                  </div>
                )}
                {displayItem.veg !== undefined && (
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1 ${
                    displayItem.veg 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-red-500/90 text-white'
                  }`}>
                    <span className="text-sm">{displayItem.veg ? '🌱' : '🍗'}</span>
                    {displayItem.veg ? 'Veg' : 'Non-Veg'}
                  </div>
                )}
              </div>

              {/* Rating Badge - Top Right */}
              {displayItem.rating && (
                <div className="absolute top-4 right-16 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl px-3 py-1.5 flex items-center gap-1.5 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                  <span className="text-yellow-500 text-base">⭐</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{displayItem.rating}</span>
                  {displayItem.reviews && (
                    <span className="text-gray-500 dark:text-gray-400 text-xs">({displayItem.reviews})</span>
                  )}
                </div>
              )}

              {/* Discount Badge - Bottom Right */}
              {getDiscount() > 0 && (
                <div className="absolute bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-2xl shadow-xl backdrop-blur-sm">
                  <div className="text-xs font-medium">SAVE</div>
                  <div className="text-lg font-bold leading-none">{getDiscount()}%</div>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="px-5 sm:px-6 py-6 space-y-5">
            {/* Header with Category */}
            <div className="space-y-2">
              {displayItem.category && (
                <div className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                  <span>📋</span>
                  {displayItem.category}
                </div>
              )}
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {displayItem.name}
              </h3>
            </div>

            {/* Quick Info Cards */}
            {(displayItem.cookingTime || displayItem.reviews) && (
              <div className="grid grid-cols-2 gap-3">
                {displayItem.cookingTime && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-4 text-center border border-orange-100 dark:border-orange-900/30">
                    <div className="text-3xl mb-1">⏱️</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ready in</p>
                    <p className="font-bold text-gray-900 dark:text-white">{displayItem.cookingTime}</p>
                  </div>
                )}
                {displayItem.reviews && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 text-center border border-blue-100 dark:border-blue-900/30">
                    <div className="text-3xl mb-1">💬</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reviews</p>
                    <p className="font-bold text-gray-900 dark:text-white">{displayItem.reviews}</p>
                  </div>
                )}
              </div>
            )}

            {/* Description with Read More */}
            {displayItem.description && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <span>📝</span>
                  Description
                </h4>
                <div className="relative">
                  <p className={`text-gray-600 dark:text-gray-300 leading-relaxed text-sm transition-all duration-300 ${
                    showFullDescription ? 'max-h-none' : 'max-h-20 overflow-hidden'
                  }`}>
                    {showFullDescription ? displayItem.description : truncateText(displayItem.description)}
                  </p>
                  
                  {!showFullDescription && shouldShowReadMore && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent" />
                  )}
                </div>
                
                {shouldShowReadMore && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-green-600 dark:text-green-400 text-sm font-semibold hover:text-green-700 dark:hover:text-green-300 transition-colors flex items-center gap-1 group"
                  >
                    {showFullDescription ? (
                      <>
                        Show less
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Read more
                        <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Ingredients */}
            {displayItem.ingredients && displayItem.ingredients.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <span>🥘</span>
                  Ingredients
                </h4>
                <div className="flex flex-wrap gap-2">
                  {displayItem.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-xl text-xs font-medium border border-green-200 dark:border-green-800 hover:scale-105 transition-transform"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing & Quantity Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-3xl p-5 space-y-4 border border-gray-200 dark:border-gray-700 shadow-inner">
              {/* Price Display */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ₹{displayItem.price}
                  </span>
                  {displayItem.originalPrice && displayItem.originalPrice > displayItem.price && (
                    <span className="text-lg text-gray-400 dark:text-gray-500 line-through">
                      ₹{displayItem.originalPrice}
                    </span>
                  )}
                </div>
                {getSavings() > 0 && quantity > 1 && (
                  <div className="text-right">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total Savings</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">₹{getSavings()}</p>
                  </div>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between bg-white dark:bg-gray-700/50 rounded-2xl p-3">
                <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                      quantity <= 1
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <span className="w-12 text-center font-bold text-2xl text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                  
                  <button
                    onClick={() => updateQuantity(quantity + 1)}
                    className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Total Price Display */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Total Amount</span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{getTotalPrice()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-gray-800 p-4 sm:p-5 backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3.5 px-5 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-200 dark:border-gray-700"
            >
              Close
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={isLoading || addedToCart}
              className={`flex-[2] py-3.5 px-5 rounded-2xl font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                addedToCart
                  ? 'bg-green-500 text-white scale-105'
                  : isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white hover:shadow-2xl hover:scale-105 active:scale-95'
              }`}
            >
              {addedToCart ? (
                <>
                  <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-base">Added!</span>
                </>
              ) : isLoading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-base">Adding...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5L7 18" />
                  </svg>
                  <span className="text-base">Add ₹{getTotalPrice()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}