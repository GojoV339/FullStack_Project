# Order Components

This directory contains components related to order tracking and management.

## Components

### OrderTracker

A real-time order status tracking component that displays order progress through a vertical stepper interface.

**Validates Requirements:** 17, 18

#### Features

- **Real-time Updates**: Automatically subscribes to Supabase Realtime for live order status changes
- **Prominent Display**: Shows Order Number and Token Number in large, easy-to-read format
- **Visual Progress**: Vertical stepper with 5 status stages (AWAITING_PAYMENT, CONFIRMED, PREPARING, READY, COLLECTED)
- **Animations**: Smooth transitions and stage-specific animations using Framer Motion
- **Glow Effect**: Special visual effect on Token Number when order status is READY
- **Order Details**: Displays cafeteria name, order items, quantities, and total amount
- **Loading States**: Shows loading spinner while fetching order data
- **Error Handling**: Displays user-friendly error messages if order cannot be loaded
- **Haptic Feedback**: Triggers device vibration when order becomes READY (if supported)

#### Props

```typescript
interface OrderTrackerProps {
  orderId: string; // The unique order ID to track
}
```

#### Usage

```tsx
import OrderTracker from '@/components/order/OrderTracker';

export default function OrderTrackerPage({ params }: { params: { orderId: string } }) {
  return (
    <div className="container mx-auto p-6">
      <OrderTracker orderId={params.orderId} />
    </div>
  );
}
```

#### Status Stages

1. **AWAITING_PAYMENT** (⏰ Clock icon, Warning color)
   - Description: "Complete payment to confirm order"
   - Shown when order is created but payment not yet completed

2. **CONFIRMED** (✅ Check icon, Success color)
   - Description: "Your order has been received"
   - Shown after successful payment confirmation

3. **PREPARING** (👨‍🍳 Chef Hat icon, Primary color)
   - Description: "Your food is being prepared"
   - Shown when kitchen staff starts preparing the order

4. **READY** (🔔 Bell icon, Success color)
   - Description: "Your order is ready! Please collect"
   - Shown when order is ready for pickup
   - **Special Effect**: Token number displays with pulsing glow animation

5. **COLLECTED** (📦 Package icon, Gray color)
   - Description: "Order completed. Enjoy your meal!"
   - Final status when student has collected their order

#### Real-time Behavior

The component uses the `useRealtimeOrder` hook to:
1. Fetch initial order data from the API
2. Subscribe to Supabase Realtime updates for the specific order
3. Automatically update the UI when order status changes
4. Unsubscribe from updates when component unmounts

Updates are received within 1 second of status changes in the database, providing a seamless real-time experience.

#### Visual Design

- **Glassmorphism**: Uses glass-card styling with backdrop blur effects
- **Color Coding**: Each status stage has a unique color for easy identification
- **Progress Line**: Animated vertical line shows completion percentage
- **Icon Animations**: Active stage icons have subtle rotation/scale animations
- **Responsive**: Adapts to mobile and desktop screen sizes

#### Testing

Comprehensive unit tests are available in `__tests__/OrderTracker.test.tsx`:
- Loading state display
- Error state handling
- Order number and token number display
- Status stage rendering
- Current status highlighting
- Order items and total display
- READY status glow effect
- Completed stage checkmarks

Run tests with:
```bash
npm test src/components/order/__tests__/OrderTracker.test.tsx
```

#### Example

See `OrderTracker.example.tsx` for a complete usage example with documentation.

## Dependencies

- `framer-motion`: For animations and transitions
- `lucide-react`: For icons
- `@/hooks/useRealtimeOrder`: Custom hook for real-time order updates
- `@/types`: TypeScript type definitions

## Related Components

- `PaymentTimer`: Countdown timer for payment completion
- `UPIPaymentInterface`: Payment interface component
- `CheckoutSummary`: Order review before payment

## Related Pages

- `/tracker/[orderId]`: Order tracker page that uses this component
- `/orders`: Order history page
- `/success`: Payment success page with link to tracker
