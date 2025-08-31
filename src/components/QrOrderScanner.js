'use client';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

const QrOrderScanner = () => {
  const [orders, setOrders] = useState([]);
  const [scanning, setScanning] = useState(false);
  const scannedSet = useRef(new Set());
  const qrScannerRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('waiterOrders');
    if (stored) {
      setOrders(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('waiterOrders', JSON.stringify(orders));
  }, [orders]);

  const startScanner = () => {
    setScanning(true);
    const html5QrCode = new Html5Qrcode('qr-reader');
    qrScannerRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          if (scannedSet.current.has(decodedText)) return;

          try {
            const parsed = JSON.parse(decodedText);
            const cartItems = Array.isArray(parsed) ? parsed : parsed.cartItems;
            if (!Array.isArray(cartItems)) throw new Error('Invalid cart format');

            // Make sure waiter has selected a table number to merge into
            const tableNumber = prompt(
              'Enter table number for this order (same table numbers will merge):'
            );

            if (!tableNumber) {
              alert('Table number is required.');
              return;
            }

            let merged = false;

            const updatedOrders = orders.map((order) => {
              if (order.tableNumber === tableNumber) {
                // Merge items
                const mergedItems = [...order.cartItems];
                cartItems.forEach((newItem) => {
                  const existingIndex = mergedItems.findIndex(
                    (i) => i.name === newItem.name
                  );
                  if (existingIndex !== -1) {
                    mergedItems[existingIndex].quantity =
                      Number(mergedItems[existingIndex].quantity) +
                      Number(newItem.quantity);
                  } else {
                    mergedItems.push(newItem);
                  }
                });

                merged = true;
                return { ...order, cartItems: mergedItems };
              } else {
                return order;
              }
            });

            if (!merged) {
              updatedOrders.push({
                id: Date.now(),
                cartItems,
                tableNumber,
                timestamp: new Date().toLocaleTimeString(),
              });
            }

            setOrders(updatedOrders);
            scannedSet.current.add(decodedText);
          } catch (err) {
            console.error('Invalid QR:', err);
          }

          stopScanner();
        },
        (errMsg) => {}
      )
      .catch((err) => {
        console.error('Failed to start scanner', err);
      });
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current
        .stop()
        .then(() => {
          qrScannerRef.current.clear();
          setScanning(false);
        })
        .catch((err) => console.error('Stop failed:', err));
    }
  };

  const handleClearAll = () => {
    setOrders([]);
    scannedSet.current.clear();
  };

  const handleMarkDone = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 rounded-xl shadow-md mb-4">
        <h2 className="text-xl font-bold text-center">📦 Live Orders: {orders.length}</h2>

        <div className="flex gap-2 mt-4 justify-center">
          {!scanning && (
            <button
              onClick={startScanner}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md font-semibold"
            >
              Start Scanning
            </button>
          )}
          {scanning && (
            <button
              onClick={stopScanner}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md font-semibold"
            >
              Stop Scanning
            </button>
          )}
        </div>
      </div>

      <div id="qr-reader" className="rounded overflow-hidden mb-4 border border-gray-300" />

      {orders.length > 0 && (
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-black font-semibold text-lg text-gray-100">📝 Orders</h3>
          <button
            className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            onClick={handleClearAll}
          >
            Clear All
          </button>
        </div>
      )}

      <div className="space-y-4">
        {orders
          .slice()
          .reverse()
          .map((order, index) => {
            const total = order.cartItems.reduce(
              (sum, item) =>
                sum + (Number(item.price) * Number(item.quantity) || 0),
              0
            );

            return (
              <div key={order.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800">
                    Table #{order.tableNumber}
                  </span>
                  <span className="text-xs text-gray-500">{order.timestamp}</span>
                </div>

                <ul className="text-sm text-gray-700 space-y-1">
                  {order.cartItems.map((item, i) => (
                    <li key={i}>
                      🍽 {item.name} × {item.quantity} — ₹
                      {Number(item.price) * Number(item.quantity) || 0}
                    </li>
                  ))}
                </ul>

                <div className="mt-2 text-right font-bold text-gray-800">
                  Total: ₹{total}
                  
                </div>

                <div className="mt-3 flex justify-between">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                    onClick={startScanner}
                  >
                    Scan Next
                  </button>
                  <button
                    className="bg-gray-700 hover:bg-gray-800 text-white text-xs px-3 py-1 rounded"
                    onClick={() => handleMarkDone(order.id)}
                  >
                    Mark Done
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default QrOrderScanner;
