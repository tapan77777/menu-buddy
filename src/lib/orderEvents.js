// Simple event listeners stored in memory
const adminListeners = new Map();       // restaurantId → Set of controllers
const customerListeners = new Map();    // orderId → Set of controllers

export function addAdminListener(restaurantId, controller) {
  if (!adminListeners.has(restaurantId)) {
    adminListeners.set(restaurantId, new Set());
  }
  adminListeners.get(restaurantId).add(controller);
}

export function addCustomerListener(orderId, controller) {
  if (!customerListeners.has(orderId)) {
    customerListeners.set(orderId, new Set());
  }
  customerListeners.get(orderId).add(controller);
}

export function removeListener(map, key, controller) {
  const set = map.get(key);
  if (set) {
    set.delete(controller);
  }
}

// Notify restaurant admins
export function notifyAdmin(restaurantId, payload) {
  const set = adminListeners.get(restaurantId);
  if (!set) return;

  for (const controller of set) {
    try {
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`)
      );
    } catch {}
  }
}

// Notify customer
export function notifyCustomer(orderId, payload) {
  const set = customerListeners.get(orderId);
  if (!set) return;

  for (const controller of set) {
    try {
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`)
      );
    } catch {}
  }
}
