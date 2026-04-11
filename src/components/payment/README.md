# PaymentTimer Component

A countdown timer component for payment completion with visual progress indicators and warning states.

## Features

- **Circular Progress Ring**: Animated SVG ring showing time remaining
- **Linear Progress Bar**: Additional horizontal progress indicator
- **Second-by-Second Updates**: Real-time countdown display
- **Three Urgency States**:
  - **Normal** (>2 minutes): Green color scheme
  - **Warning** (1-2 minutes): Amber color scheme with gentle reminder
  - **Critical** (<1 minute): Red color scheme with pulsing animation and urgent alert
- **Auto-Expire Callback**: Triggers when timer reaches zero
- **Graceful Error Handling**: Handles null/expired dates properly
- **Accessible**: Descriptive labels for screen readers

## Usage

```tsx
import PaymentTimer from '@/components/payment/PaymentTimer';

function CheckoutPage() {
  const expiresAt = order.expiresAt; // Date object or ISO string

  const handleExpire = async () => {
    // Handle order expiration
    await expireOrder(orderId);
    clearCart();
    router.push('/menu');
  };

  return (
    <PaymentTimer 
      expiresAt={expiresAt} 
      onExpire={handleExpire}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `expiresAt` | `Date \| string \| null` | Yes | The expiration date/time for the payment |
| `onExpire` | `() => void` | No | Callback function triggered when timer expires |

## Visual States

### Normal State (>2 minutes)
- Green progress ring (#10B981)
- No warning messages
- Steady countdown display

### Warning State (1-2 minutes)
- Amber progress ring (#F59E0B)
- "Please complete your payment soon" message
- Steady countdown display

### Critical State (<1 minute)
- Red progress ring (#EF4444)
- "Hurry! Less than 1 minute remaining" message with warning icon
- Pulsing animation on timer display
- Increased visual urgency

### Expired State
- "Order expired" label
- "Time's up! Order has expired" message
- Triggers `onExpire` callback if provided

## Integration with useCountdown Hook

The component uses the `useCountdown` hook which provides:
- `timeLeft`: Total seconds remaining
- `minutes`: Formatted minutes
- `seconds`: Formatted seconds
- `progress`: Percentage (0-100) based on 5-minute timer
- `isExpired`: Boolean flag for expiration

## Requirements

**Validates: Requirements 13**

- ✅ Displays 5-minute countdown timer on payment page
- ✅ Updates every second with visual progress indication
- ✅ Automatically expires order when timer reaches 0
- ✅ Updates order status to CANCELLED and payment status to EXPIRED
- ✅ Displays "Order expired. Please try again." message
- ✅ Uses useCountdown custom hook for countdown logic

## Testing

Comprehensive unit tests are available in `__tests__/PaymentTimer.test.tsx`:

```bash
npm test -- src/components/payment/__tests__/PaymentTimer.test.tsx
```

## Example

See `PaymentTimer.example.tsx` for interactive examples of all states and usage patterns.

## Dependencies

- `framer-motion`: For smooth animations
- `lucide-react`: For Clock and AlertTriangle icons
- `@/hooks/useCountdown`: Custom countdown hook

## Styling

The component uses Tailwind CSS with custom color tokens:
- `text-success`: Green (#10B981)
- `text-warning`: Amber (#F59E0B)
- `text-error`: Red (#EF4444)
- `bg-success/10`, `bg-warning/10`, `bg-error/10`: Semi-transparent backgrounds

Ensure these colors are defined in your Tailwind configuration.
