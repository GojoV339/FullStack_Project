# LoadingSkeleton Component

A reusable loading skeleton component that displays placeholder content while data is being fetched. The component uses shimmer animations and glassmorphism effects to match the Amrita Feast design system.

## Features

- **Shimmer Animation**: Smooth left-to-right shimmer effect that loops continuously
- **Multiple Variants**: Supports cafeteria cards, menu items, and order cards
- **Glassmorphism**: Uses the app's glass-card styling for consistency
- **Responsive**: Matches the shape and size of actual content
- **Animated Entrance**: Staggered fade-in animation for multiple skeletons
- **Warm Color Palette**: Uses white/5 opacity to match the design system

## Usage

### Basic Usage

```tsx
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

// Default menu skeleton (1 item)
<LoadingSkeleton />

// Menu skeleton with 6 items
<LoadingSkeleton variant="menu" count={6} />
```

### Cafeteria Cards

Use when loading cafeteria selection page:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <LoadingSkeleton variant="cafeteria" count={3} />
</div>
```

### Menu Items

Use when loading menu items on the menu page:

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <LoadingSkeleton variant="menu" count={6} />
</div>
```

### Order Cards

Use when loading order history:

```tsx
<div className="space-y-4">
  <LoadingSkeleton variant="order" count={5} />
</div>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'cafeteria' \| 'menu' \| 'order'` | `'menu'` | The type of skeleton to display |
| `count` | `number` | `1` | Number of skeleton items to render |

## Variants

### Cafeteria Variant

- Large image placeholder (h-40)
- Title and subtitle placeholders
- Status badge placeholders
- Used on: `/cafeteria` page

### Menu Variant

- Medium image placeholder (h-28)
- Name placeholder (2 lines)
- Price and button placeholders
- Used on: `/menu` page

### Order Variant

- Order header with number and status badge
- Order details (2 lines)
- Footer with date and amount
- Used on: `/orders` page

## Animation Details

- **Entrance Animation**: Each skeleton fades in with a staggered delay (0.1s per item)
- **Shimmer Animation**: Continuous 2s linear animation from left to right
- **Scale Animation**: Menu items scale from 0.9 to 1.0 on entrance
- **Slide Animation**: Order items slide in from the left

## Design System Integration

The component uses the following design tokens:

- **Glass Card**: `glass-card` class for glassmorphism effect
- **Shimmer**: `shimmer` class for animation
- **Colors**: `bg-white/5` for skeleton elements
- **Border Radius**: Matches content (rounded-lg, rounded-full)
- **Spacing**: Consistent with actual content spacing

## Requirements

Validates **Requirement 33**: Loading States and Skeletons

- ✅ Displays skeleton loading placeholders while data is being fetched
- ✅ Matches the shape and size of the content it represents
- ✅ Animates with a shimmer effect from left to right
- ✅ Loops continuously until content loads
- ✅ Used for cafeteria cards (3 skeletons)
- ✅ Used for menu items (6 skeletons)
- ✅ Used for orders (variable count)

## Examples

See `LoadingSkeleton.example.tsx` for visual examples of all variants.

## Testing

The component includes comprehensive unit tests in `__tests__/LoadingSkeleton.test.tsx`:

- Renders correct variant
- Displays specified number of skeletons
- Applies shimmer animation
- Uses glassmorphism effects
- Matches content dimensions

Run tests:
```bash
npm test -- src/components/ui/__tests__/LoadingSkeleton.test.tsx
```
