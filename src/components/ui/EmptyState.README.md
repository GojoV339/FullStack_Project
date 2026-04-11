# EmptyState Component

A reusable component for displaying empty states throughout the Amrita Feast PWA.

## Overview

The EmptyState component provides a consistent, visually appealing way to communicate when there's no content to display. It follows the app's design system with warm colors, glassmorphism effects, and smooth animations.

## Features

- **Icon Display**: Accepts any Lucide icon component for contextual representation
- **Message Text**: Clear title and descriptive message
- **Optional CTA**: Call-to-action button for user guidance
- **Animations**: Smooth entrance animations using Framer Motion
- **Responsive**: Centered layout that works on all screen sizes
- **Design System**: Uses warm color palette and glassmorphism effects

## Props

```typescript
interface EmptyStateProps {
  icon: LucideIcon;           // Lucide icon component to display
  title: string;              // Main heading text
  message: string;            // Descriptive message text
  action?: {                  // Optional action button
    label: string;            // Button text
    onClick: () => void;      // Click handler
  };
}
```

## Usage Examples

### Empty Cart

```tsx
import EmptyState from '@/components/ui/EmptyState';
import { ShoppingBag } from 'lucide-react';

<EmptyState
  icon={ShoppingBag}
  title="Your cart is empty"
  message="Add items from the menu to get started"
  action={{
    label: 'Browse Menu',
    onClick: () => router.push('/menu'),
  }}
/>
```

### No Orders

```tsx
import { Package } from 'lucide-react';

<EmptyState
  icon={Package}
  title="No orders yet"
  message="You haven't placed any orders. Start by browsing our delicious menu!"
  action={{
    label: 'Order Now',
    onClick: () => router.push('/cafeteria'),
  }}
/>
```

### No Search Results

```tsx
import { Search } from 'lucide-react';

<EmptyState
  icon={Search}
  title="No items match your search"
  message="Try searching with different keywords or browse all items"
/>
```

### Generic Empty State

```tsx
import { FileText } from 'lucide-react';

<EmptyState
  icon={FileText}
  title="Nothing to show"
  message="There's no content available at the moment"
/>
```

## Design Specifications

### Layout
- Centered vertically and horizontally
- Padding: 12px vertical, 6px horizontal
- Max width for message: 320px (xs breakpoint)

### Icon Container
- Size: 80px × 80px (w-20 h-20)
- Background: white with 5% opacity
- Border radius: Full circle
- Glow effect: Primary color with 10% opacity and blur

### Typography
- **Title**: 18px (text-lg), semibold, white with 70% opacity
- **Message**: 14px (text-sm), white with 40% opacity

### Animations
- **Container**: Fade in + slide up (20px), 300ms duration
- **Icon**: Scale from 0.8 to 1, spring animation with 200 stiffness
- **Title**: Fade in, 200ms delay
- **Message**: Fade in, 300ms delay
- **Button**: Fade in + slide up (10px), 400ms delay

### Button
- Uses `btn-primary` class from design system
- Margin top: 24px (mt-6)
- Scale down to 0.95 on tap

## Accessibility

- Semantic HTML structure
- Clear, descriptive text
- Keyboard accessible button (when provided)
- Proper heading hierarchy

## Related Components

- **LoadingSkeleton**: Shows loading state before empty state
- **CartSheet**: Uses EmptyState for empty cart
- **Orders Page**: Uses EmptyState for no orders

## Requirements

Validates: **Requirement 33** - Loading States and Skeletons
- Icon display ✓
- Message text ✓
- Call-to-action button ✓
- Used for: empty cart, no orders, no search results ✓

## Testing

See `__tests__/EmptyState.test.tsx` for unit tests covering:
- Rendering with icon, title, and message
- Optional action button
- Click handler functionality
- Icon display
