/**
 * Example usage of UPIPaymentInterface component
 * **Validates: Requirements 14, 15**
 */

'use client';

import { useState } from 'react';
import UPIPaymentInterface from './UPIPaymentInterface';
import { toast } from 'sonner';

export default function UPIPaymentInterfaceExample() {
  const [showDemo, setShowDemo] = useState(true);

  const handleSuccess = () => {
    console.log('Payment successful!');
    toast.success('Payment completed successfully!');
    // In a real application, you would:
    // - Clear cart
    // - Navigate to order tracker
    // - Show success message
  };

  const handleError = (error: string) => {
    console.error('Payment error:', error);
    toast.error(error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-6">
      <h1 className="text-2xl font-bold text-white mb-8 text-center">
        UPIPaymentInterface Component Examples
      </h1>

      <div className="max-w-md mx-auto space-y-6">
        {/* Example 1: Demo Mode (No Cashfree Session) */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Demo Mode (Simulated Payment)
          </h2>
          <UPIPaymentInterface
            orderId="demo-order-123"
            tokenNumber={42}
            totalAmount={250}
            cafeteriaName="Samridhi (Main Block)"
            cashfreeSessionId={null}
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <p className="text-white/50 text-xs mt-4">
            This demo simulates payment without actual Cashfree integration
          </p>
        </div>

        {/* Example 2: With Cashfree Session */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Production Mode (With Cashfree)
          </h2>
          <UPIPaymentInterface
            orderId="AF-2024-0042"
            tokenNumber={42}
            totalAmount={350}
            cafeteriaName="Canteen Main (Admin Block)"
            cashfreeSessionId="session_abc123xyz"
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <p className="text-white/50 text-xs mt-4">
            This would integrate with actual Cashfree payment gateway
          </p>
        </div>
      </div>

      {/* Usage Code Example */}
      <div className="glass-card p-6 max-w-4xl mx-auto mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Usage Example</h2>
        <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto">
          <code className="text-sm text-white/70">
{`import UPIPaymentInterface from '@/components/payment/UPIPaymentInterface';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

// In your checkout page
const CheckoutPage = () => {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  
  const handlePaymentSuccess = () => {
    clearCart();
    router.push(\`/tracker/\${orderId}\`);
    toast.success('Payment successful!');
  };
  
  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  return (
    <div>
      <PaymentTimer expiresAt={order.expiresAt} />
      
      <UPIPaymentInterface
        orderId={order.id}
        tokenNumber={order.tokenNumber}
        totalAmount={order.totalAmount}
        cafeteriaName={order.cafeteria.name}
        cashfreeSessionId={order.cashfreeSessionId}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
};`}
          </code>
        </pre>
      </div>

      {/* Features List */}
      <div className="glass-card p-6 max-w-4xl mx-auto mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Features</h2>
        <ul className="space-y-2 text-white/70 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>UPI app grid with GPay, PhonePe, Paytm, and BHIM</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>UPI ID input field for manual entry</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>QR code display modal for scanning</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>UPI intent triggering for selected apps</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Processing animation with loading spinner</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Success overlay with order details (token, cafeteria, amount)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Smooth animations using Framer Motion</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Cashfree integration support (sandbox/production)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Demo mode for testing without payment gateway</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Error handling with callback support</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Glassmorphism UI with warm color palette</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Mobile-first responsive design</span>
          </li>
        </ul>
      </div>

      {/* Payment Flow Diagram */}
      <div className="glass-card p-6 max-w-4xl mx-auto mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Payment Flow</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="text-white font-medium">Select Payment Method</p>
              <p className="text-white/50 text-xs">Choose UPI app, enter UPI ID, or scan QR code</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="text-white font-medium">Processing</p>
              <p className="text-white/50 text-xs">Show loading animation (minimum 2.5 seconds)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="text-white font-medium">Cashfree Integration</p>
              <p className="text-white/50 text-xs">Initiate payment with Cashfree SDK (if session ID provided)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="text-white font-medium">Success Overlay</p>
              <p className="text-white/50 text-xs">Display success animation with order details</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
              5
            </div>
            <div>
              <p className="text-white font-medium">Redirect</p>
              <p className="text-white/50 text-xs">Call onSuccess callback to navigate to order tracker</p>
            </div>
          </div>
        </div>
      </div>

      {/* UPI Apps Info */}
      <div className="glass-card p-6 max-w-4xl mx-auto mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Supported UPI Apps</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-4xl mb-2">🟢</div>
            <p className="text-white text-sm font-medium">Google Pay</p>
            <p className="text-white/40 text-xs">GPay</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🟣</div>
            <p className="text-white text-sm font-medium">PhonePe</p>
            <p className="text-white/40 text-xs">PhonePe</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🔵</div>
            <p className="text-white text-sm font-medium">Paytm</p>
            <p className="text-white/40 text-xs">Paytm UPI</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🟠</div>
            <p className="text-white text-sm font-medium">BHIM</p>
            <p className="text-white/40 text-xs">BHIM UPI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
