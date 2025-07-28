'use client';
import { QRCodeCanvas } from 'qrcode.react';

export default function OrderQRModal({ cartItems, onClose }) {
  const orderData = {
    cartItems: cartItems.map(({ name, quantity, price }) => ({
      name,
      quantity,
      price,
    })),
    createdAt: new Date().toISOString(), // optional
    // You can also add tableNumber, customerId etc. if needed
  };

  const qrValue = JSON.stringify(orderData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100]">
      <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center relative">
        <h2 className="text-xl font-bold mb-4 text-black">Show this to the waiter</h2>
        <QRCodeCanvas value={qrValue} size={256} />
        <p className="text-gray-500 text-sm mt-2 text-black">Scan with waiter app</p>

        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
