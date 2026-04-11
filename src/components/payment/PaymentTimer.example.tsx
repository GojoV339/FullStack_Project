/**
 * Example usage of PaymentTimer component
 * **Validates: Requirements 13**
 */

'use client';

import { useState } from 'react';
import PaymentTimer from './PaymentTimer';

export default function PaymentTimerExample() {
  // Example 1: Timer with 5 minutes expiry
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

  // Example 2: Timer with 2 minutes expiry (warning state)
  const twoMinutesFromNow = new Date(Date.now() + 2 * 60 * 1000);

  // Example 3: Timer with 30 seconds expiry (critical state)
  const thirtySecondsFromNow = new Date(Date.now() + 30 * 1000);

  // Example 4: Expired timer
  const pastDate = new Date(Date.now() - 1000);

  const [showExpiredMessage, setShowExpiredMessage] = useState(false);

  const handleExpire = () => {
    console.log('Timer expired!');
    setShowExpiredMessage(true);
    // In a real application, you would:
    // - Call API to expire the order
    // - Clear cart
    // - Redirect to menu or show error message
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-6">
      <h1 className="text-2xl font-bold text-white mb-8 text-center">
        PaymentTimer Component Examples
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Example 1: Normal State (5 minutes) */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Normal State (5 minutes)
          </h2>
          <PaymentTimer expiresAt={fiveMinutesFromNow} />
          <p className="text-white/50 text-sm mt-4">
            Green progress ring indicates plenty of time remaining
          </p>
        </div>

        {/* Example 2: Warning State (2 minutes) */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Warning State (2 minutes)
          </h2>
          <PaymentTimer expiresAt={twoMinutesFromNow} />
          <p className="text-white/50 text-sm mt-4">
            Amber progress ring with "complete payment soon" message
          </p>
        </div>

        {/* Example 3: Critical State (30 seconds) */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Critical State (30 seconds)
          </h2>
          <PaymentTimer expiresAt={thirtySecondsFromNow} />
          <p className="text-white/50 text-sm mt-4">
            Red progress ring with pulsing animation and urgent warning
          </p>
        </div>

        {/* Example 4: Expired State */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Expired State
          </h2>
          <PaymentTimer expiresAt={pastDate} />
          <p className="text-white/50 text-sm mt-4">
            Shows expired message when timer reaches zero
          </p>
        </div>

        {/* Example 5: With onExpire Callback */}
        <div className="glass-card p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">
            With onExpire Callback
          </h2>
          <PaymentTimer
            expiresAt={new Date(Date.now() + 10 * 1000)} // 10 seconds for demo
            onExpire={handleExpire}
          />
          {showExpiredMessage && (
            <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-error text-sm font-medium">
                ⚠️ Order expired! Callback triggered.
              </p>
            </div>
          )}
          <p className="text-white/50 text-sm mt-4">
            This timer will trigger the onExpire callback after 10 seconds
          </p>
        </div>
      </div>

      {/* Usage Code Example */}
      <div className="glass-card p-6 max-w-4xl mx-auto mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Usage Example</h2>
        <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto">
          <code className="text-sm text-white/70">
{`import PaymentTimer from '@/components/payment/PaymentTimer';

// In your checkout page
const expiresAt = order.expiresAt; // Date from order creation

const handleExpire = async () => {
  // Expire the order via API
  await fetch(\`/api/orders/\${orderId}/expire\`, {
    method: 'DELETE'
  });
  
  // Clear cart and redirect
  clearCart();
  router.push('/menu');
  toast.error('Order expired. Please try again.');
};

<PaymentTimer 
  expiresAt={expiresAt} 
  onExpire={handleExpire}
/>`}
          </code>
        </pre>
      </div>

      {/* Features List */}
      <div className="glass-card p-6 max-w-4xl mx-auto mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Features</h2>
        <ul className="space-y-2 text-white/70 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Circular progress ring with smooth animations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Linear progress bar for additional visual feedback</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Second-by-second countdown updates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Three urgency states: normal (green), warning (amber), critical (red)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Warning message at 2 minutes remaining</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Critical alert with pulsing animation at 1 minute remaining</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Auto-expire callback when timer reaches zero</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Graceful handling of null/expired dates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Accessible with descriptive labels</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
