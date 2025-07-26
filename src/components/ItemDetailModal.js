'use client';


export default function ItemDetailModal({ item, onClose, onAddToCart }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl max-w-lg w-full mx-4 relative">
        <h3 className="text-xl font-semibold mb-4">{item.name}</h3>
        <img
          src={item.imageUrl}
          alt={item.name}
          className="rounded-xl w-full mb-4"
        />
        <p className="mb-2 text-neutral-600 dark:text-neutral-300">{item.description}</p>
        <p className="font-bold mb-4">₹{item.price}</p>
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={() => onAddToCart(item)}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
