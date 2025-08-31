'use client';
import { QRCodeCanvas } from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';

export default function OrderQRModal({ cartItems = [], onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  const safeNumber = (value) => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? 1 : num;
  };

  const validCartItems = Array.isArray(cartItems) ? cartItems : [];

  const totalItems = validCartItems.reduce((sum, item) => {
    return sum + safeNumber(item.quantity || item.qty);
  }, 0);

  const totalAmount = validCartItems.reduce((sum, item) => {
    const price = safeNumber(item.price);
    const quantity = safeNumber(item.quantity || item.qty);
    return sum + (price * quantity);
  }, 0);

  const orderId = `MB${Date.now().toString().slice(-6)}`;

  const orderData = {
    cartItems: validCartItems.map((item) => ({
      name: item.name || 'Unknown Item',
      quantity: safeNumber(item.quantity || item.qty),
      price: safeNumber(item.price),
      subtotal: safeNumber(item.price) * safeNumber(item.quantity || item.qty)
    })).filter(item => item.quantity > 0),
    createdAt: new Date().toISOString(),
    orderId,
    totalItems,
    totalAmount
  };

  const qrValue = JSON.stringify(orderData);

  // ✅ stable reference
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-2xl w-full max-w-sm shadow-2xl transform transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        } max-h-[90vh] overflow-y-auto`}   
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-6 text-white sticky top-0 rounded-t-2xl">
        

          <div className="text-center">
            <h2 className="text-xl font-bold mb-1">Order Ready!</h2>
            <p className="text-emerald-100 text-sm">Show this QR code to your waiter</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
        

          {/* QR Code */}
          <div className="text-center mb-4">
            <div className="inline-block p-4 bg-white rounded-xl shadow-lg border-2 border-emerald-100">
              <QRCodeCanvas 
                value={qrValue} 
                size={250}
                level="H"
                fgColor="#030404ff"
                bgColor="#ffffff"
              />
            </div>
            <button
            onClick={handleClose}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition-colors"
          >
            Done
          </button>
          </div>

          {/* Close Button */}
          
        </div>
      </div>
    </div>
  );
}
