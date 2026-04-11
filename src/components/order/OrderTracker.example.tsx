/**
 * OrderTracker Component Example
 * 
 * This example demonstrates how to use the OrderTracker component
 * to display real-time order status tracking.
 */

import OrderTracker from './OrderTracker';

export default function OrderTrackerExample() {
  // Example order ID - in real usage, this would come from route params or props
  const orderId = 'example-order-id';

  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          Order Tracker Example
        </h1>

        {/* OrderTracker Component */}
        <OrderTracker orderId={orderId} />

        {/* Usage Notes */}
        <div className="mt-8 glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Component Features
          </h2>
          <ul className="space-y-2 text-white/70 text-sm">
            <li>✅ Real-time order status updates via Supabase Realtime</li>
            <li>✅ Prominent display of Order Number and Token Number</li>
            <li>✅ Vertical stepper with 5 status stages</li>
            <li>✅ Animated status transitions with Framer Motion</li>
            <li>✅ Glow effect on Token Number when order is READY</li>
            <li>✅ Stage-specific icons and animations</li>
            <li>✅ Order items list with quantities and prices</li>
            <li>✅ Loading and error states</li>
            <li>✅ Responsive design with glassmorphism effects</li>
          </ul>
        </div>

        {/* Status Stages */}
        <div className="mt-6 glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Order Status Stages
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-warning font-semibold">1.</span>
              <div>
                <p className="text-white font-medium">AWAITING_PAYMENT</p>
                <p className="text-white/50">Complete payment to confirm order</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-success font-semibold">2.</span>
              <div>
                <p className="text-white font-medium">CONFIRMED</p>
                <p className="text-white/50">Your order has been received</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-semibold">3.</span>
              <div>
                <p className="text-white font-medium">PREPARING</p>
                <p className="text-white/50">Your food is being prepared</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-success font-semibold">4.</span>
              <div>
                <p className="text-white font-medium">READY</p>
                <p className="text-white/50">Your order is ready! Please collect</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-white/50 font-semibold">5.</span>
              <div>
                <p className="text-white font-medium">COLLECTED</p>
                <p className="text-white/50">Order completed. Enjoy your meal!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Notes */}
        <div className="mt-6 glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Integration Guide
          </h2>
          <div className="space-y-3 text-sm text-white/70">
            <p>
              <strong className="text-white">Props:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <code className="text-primary">orderId</code> (string, required) - 
                The unique order ID to track
              </li>
            </ul>

            <p className="mt-4">
              <strong className="text-white">Real-time Updates:</strong>
            </p>
            <p>
              The component automatically subscribes to Supabase Realtime updates
              for the specified order. When the order status changes in the database,
              the UI updates within 1 second without requiring a page refresh.
            </p>

            <p className="mt-4">
              <strong className="text-white">Animations:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Pulsing animation on active status stage</li>
              <li>Glow effect on token number when READY</li>
              <li>Smooth transitions between status stages</li>
              <li>Icon animations (rotation, scale) for visual feedback</li>
              <li>Progress line animation showing completion percentage</li>
            </ul>

            <p className="mt-4">
              <strong className="text-white">Haptic Feedback:</strong>
            </p>
            <p>
              When the order status changes to READY, the component triggers
              haptic vibration (if supported by the device) to alert the user.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
