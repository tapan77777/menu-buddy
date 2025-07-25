import { useEffect, useState } from 'react';

export const CartModal = () => {
  const [showCart, setShowCart] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [cartItems, setCartItems] = useState([
    {
      _id: 1,
      name: "Chicken Roll Deluxe",
      imageUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=100&h=100&fit=crop",
      price: 450,
      originalPrice: 500,
      quantity: 2
    },
    {
      _id: 2,
      name: "Fresh Mojito",
      imageUrl: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=100&h=100&fit=crop",
      price: 782,
      originalPrice: 832,
      quantity: 1
    },
    {
      _id: 3,
      name: "Special Burger",
      imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=100&h=100&fit=crop",
      price: 299,
      originalPrice: 349,
      quantity: 1
    }
  ]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowCart(false);
      setIsClosing(false);
    }, 300);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter(item => item._id !== id));
    } else {
      setCartItems(cartItems.map(item => 
        item._id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalSavings = () => {
    return cartItems.reduce((total, item) => 
      total + ((item.originalPrice - item.price) * item.quantity), 0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Demo function to show cart
  const openCart = () => {
    setShowCart(true);
  };

  // Prevent scroll when modal is open
  useEffect(() => {
    if (showCart) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCart]);

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
      {/* Demo Button */}
      <button
        onClick={openCart}
        className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
      >
        <span>🛒</span>
        Open Cart ({getTotalItems()})
      </button>

      {/* Enhanced Cart Modal */}
      {showCart && (
        <div
          className={`fixed inset-0 z-50 flex items-end justify-center sm:items-center transition-all duration-300 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleBackdropClick}
        >
          {/* Animated Backdrop */}
          <div 
            className={`absolute inset-0 transition-all duration-300 ${
              isClosing ? 'bg-black/0' : 'bg-black/50'
            }`}
            style={{
              backdropFilter: isClosing ? 'blur(0px)' : 'blur(4px)',
            }}
          />

          {/* Cart Container */}
          <div
            className={`bg-white w-full sm:w-[90%] max-w-md rounded-t-3xl sm:rounded-2xl relative overflow-hidden max-h-[90vh] shadow-2xl transform transition-all duration-300 ease-out ${
              isClosing 
                ? 'translate-y-full sm:translate-y-8 sm:scale-95 opacity-0' 
                : 'translate-y-0 sm:scale-100 opacity-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    🛒
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                    <p className="text-sm text-gray-500">{getTotalItems()} items</p>
                  </div>
                </div>
                
                <button
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110"
                  onClick={handleClose}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6">
              {cartItems.length > 0 ? (
                <div className="space-y-4 py-4">
                  {cartItems.map((item, index) => (
                    <div 
                      key={item._id} 
                      className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 hover:bg-gray-100 transition-colors duration-200"
                      style={{
                        animation: `slideInRight 0.4s ease-out ${index * 100}ms forwards`
                      }}
                    >
                      {/* Item Image */}
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl shadow-md"
                      />
                      
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-green-600 font-bold text-sm">₹{item.price}</span>
                          {item.originalPrice > item.price && (
                            <span className="text-gray-400 line-through text-xs">₹{item.originalPrice}</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:border-red-300 hover:text-red-500 transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                        
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5L7 18" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 text-sm">Add some delicious items to get started!</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 space-y-4">
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                    <span className="font-semibold">₹{getTotalAmount()}</span>
                  </div>
                  {getTotalSavings() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Total Savings</span>
                      <span className="text-green-600 font-semibold">-₹{getTotalSavings()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">₹{getTotalAmount()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setCartItems([])}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Clear Cart
                  </button>
                  
                  <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
                    <span>Proceed</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

