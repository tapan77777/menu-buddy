// src/app/subscription/page.js - CREATE THIS FILE
'use client';

import SubscriptionPlans from '@/components/SubscriptionPlans';
import { useEffect } from 'react';

export default function SubscriptionPage() {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // In a real app, you'd get this from authentication context
  // For now, using a placeholder - replace with actual restaurant ID
  const restaurantId = 'your-restaurant-id'; // Replace with actual logic

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SubscriptionPlans restaurantId={restaurantId} />
    </div>
  );
}