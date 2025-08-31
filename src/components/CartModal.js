'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import OrderQRModal from './OrderQRModal';

const CartModal = ({ cartItems, setShowCart, updateQuantity, setCartItems, showCart }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

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

const getTotalAmount = () => {
  return cartItems.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return total + (price * qty);
  }, 0);
};


const getTotalSavings = () => {
  return cartItems.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return total + ((price + 50 - price) * qty); // ₹50 savings
  }, 0);
};


 const getTotalItems = () => {
  return cartItems.reduce((total, item) => {
    const qty = Number(item.quantity) || 1;
    return total + qty;
  }, 0);
};


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
    showCart && (
      <div
        className={`fixed inset-0 z-50 flex items-end justify-center sm:items-center transition-all duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isClosing ? 'bg-black/0' : 'bg-black/50'
          }`}
          style={{
            backdropFilter: isClosing ? 'blur(0px)' : 'blur(4px)',
          }}
        />

        {/* Modal */}
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
                  <p className="text-sm text-gray-500"> items</p>          
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

   {/* Items */}
<div className="overflow-y-auto max-h-[60vh] px-6 py-4">
  {cartItems.length > 0 ? (
    <div className="space-y-4 py-4">
      {cartItems.map((item, index) => (
        <div
          key={item._id}
          className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 hover:bg-gray-100 transition-colors duration-200"
        >
          {/* Item Image */}
          <Image
  src={item.imageUrl}
  alt={item.name}
  width={64}   // w-16 = 64px
  height={64}  // h-16 = 64px
  className="w-16 h-16 object-cover rounded-xl shadow-md"
/>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-green-600 font-bold text-sm">
                ₹{Number(item.price)}
              </span>
              <span className="text-gray-400 line-through text-xs">
                ₹{Number(item.price) + 50}
              </span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item._id, Number(item.quantity || 1) - 1)}
              className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full text-gray-600 hover:border-red-300 hover:text-red-500 transition-all duration-200 hover:scale-110"
            >
              -
            </button>

            <span className="w-8 text-center font-bold text-gray-900">
              {Number(item.quantity) || 1}
            </span>
            

            <button
              onClick={() => updateQuantity(item._id, Number(item.quantity || 1) + 1)}
              className="w-8 h-8 bg-green-500 rounded-full text-white hover:bg-green-600 transition-all duration-200 hover:scale-110"
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-16 text-gray-500">Your cart is empty</div>
  )}
</div>


          {/* Footer */}
         {/* Footer */}
         
{cartItems.length > 0 && (
  <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 space-y-4">
    {/* Summary */}
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-black">
          Subtotal ({cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0)} items)
        </span>
        <span className="font-semibold text-black">
          ₹{cartItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity || 1)), 0)}
        </span>
      </div>

      {/* Total Savings (assuming ₹50 off per item as earlier) */}
      <div className="flex justify-between text-sm">
        <span className="text-green-600">Total Savings</span>
        <span className="text-green-600 font-semibold">
          -₹{cartItems.reduce((sum, item) => sum + (50 * Number(item.quantity || 1)), 0)}
        </span>
      </div>

      <div className="border-t pt-2 flex justify-between font-bold text-lg">
        <span className='text-black'>Total</span>
        <span className="text-green-600">
          ₹{cartItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity || 1)), 0)}
        </span>
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

      {/* //OrderQRModal */}
      {showQRModal && (
  <OrderQRModal cartItems={cartItems} onClose={() => setShowQRModal(false)} />
)}

      <button
      onClick={() => setShowQRModal(true)}
        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
      >
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
    )
  );
};

export default CartModal;
