/**
 * CheckoutSummary Component Example
 * 
 * This example demonstrates how to use the CheckoutSummary component
 * in the checkout page to display order details before payment.
 */

'use client';

import CheckoutSummary from './CheckoutSummary';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutSummaryExample() {
  // The component automatically reads from the cart store
  const items = useCartStore((s) => s.items);

  const handleProceedToPayment = () => {
    console.log('Proceeding to payment...');
    // In the actual implementation, this would:
    // 1. Create an order via API
    // 2. Get the order number and payment session
    // 3. Navigate to payment interface
  };

  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          Checkout Example
        </h1>

        {items.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-white/50">
              Add items to cart to see the checkout summary
            </p>
          </div>
        ) : (
          <>
            {/* Without order number (before order creation) */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white/70 mb-3">
                Before Order Creation
              </h2>
              <CheckoutSummary onProceedToPayment={handleProceedToPayment} />
            </div>

            {/* With order number (after order creation) */}
            <div>
              <h2 className="text-lg font-semibold text-white/70 mb-3">
                After Order Creation
              </h2>
              <CheckoutSummary
                orderNumber="AF-2024-0001"
                onProceedToPayment={handleProceedToPayment}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
