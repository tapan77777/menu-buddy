'use client';

export default function CartModal({ cartItems, removeFromCart, setShowCart }) {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50">
      <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Your Cart</h3>
          <button
            onClick={() => setShowCart(false)}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
          >
            Close
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty</p>
        ) : (
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <li key={item._id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">₹{item.price}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
