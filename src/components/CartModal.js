"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import CheckoutPopup from "./CheckoutPopup";

const CartModal = ({
  cartItems,
  setShowCart,
  updateQuantity,
  setCartItems,
  showCart,
  restaurantId,
  tableId,
}) => {
  const [isClosing,    setIsClosing]    = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Normalise qty field — handles both `quantity` and `qty` shapes
  const normalizedCartItems = cartItems.map((item) => ({
    ...item,
    quantity: Number(item.quantity ?? item.qty ?? 1),
  }));

  const itemCount = normalizedCartItems.reduce((s, i) => s + i.quantity, 0);
  const total     = normalizedCartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setShowCart(false); setIsClosing(false); }, 280);
  };

  useEffect(() => {
    if (showCart) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, [showCart]);

  return (
    <>
      {showCart && (
        <div
          className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-opacity duration-280 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Sheet */}
          <div
            className={`relative bg-white w-full sm:w-[90%] max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] transition-all duration-280 ease-out ${
              isClosing ? "translate-y-full sm:translate-y-6 opacity-0" : "translate-y-0 opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
                <p className="text-xs text-gray-400 mt-0.5">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
                aria-label="Close cart"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {normalizedCartItems.map((item) => (
                <div key={item._id} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                  {/* Image with fallback */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                    )}
                  </div>

                  {/* Name + price */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                    <p className="text-orange-600 font-bold text-sm mt-0.5">₹{item.price}</p>
                  </div>

                  {/* Quantity stepper */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors font-bold"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold text-gray-900 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white transition-colors font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            {normalizedCartItems.length > 0 && (
              <div className="border-t border-gray-100 px-5 pt-4 pb-6 space-y-4">
                {/* Bill summary — no fake discounts */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                  <span className="text-base font-black text-gray-900">₹{total}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setCartItems([])}
                    className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                  >
                    Proceed to Order
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showCheckout && (
        <CheckoutPopup
          cartItems={normalizedCartItems}
          restaurantId={restaurantId}
          tableId={tableId}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
};

export default CartModal;
