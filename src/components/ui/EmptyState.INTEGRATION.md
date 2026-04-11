# EmptyState Integration Guide

This guide shows how to integrate the EmptyState component into various parts of the Amrita Feast PWA.

## Integration Points

### 1. Cart Sheet (Empty Cart)

**Location**: `src/components/cart/CartSheet.tsx`

**Current Implementation** (lines 80-91):
```tsx
<div className="flex flex-col items-center justify-center h-full text-center py-12">
  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
    <ShoppingBag size={32} className="text-white/30" />
  </div>
  <h3 className="text-lg font-semibold text-white/70 mb-2">
    Your cart is empty
  </h3>
  <p className="text-sm text-white/40">
    Add items from the menu to get started
  </p>
</div>
```

**Recommended Refactor**:
```tsx
import EmptyState from '@/components/ui/EmptyState';
import { ShoppingBag } from 'lucide-react';

// Replace the manual empty state with:
<EmptyState
  icon={ShoppingBag}
  title="Your cart is empty"
  message="Add items from the menu to get started"
/>
```

### 2. Orders Page (No Orders)

**Location**: `app/(app)/orders/page.tsx`

**Current Implementation** (lines 49-58):
```tsx
<div className="text-center py-20">
  <span className="text-5xl">🍽️</span>
  <p className="text-white/40 mt-4">No orders yet</p>
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={() => router.push('/cafeteria')}
    className="btn-primary mt-6"
  >
    Order Now
  </motion.button>
</div>
```

**Recommended Refactor**:
```tsx
import EmptyState from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

const router = useRouter();

// Replace with:
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

### 3. Menu Page (No Search Results)

**Location**: `app/(app)/menu/page.tsx`

**Current Implementation** (lines 169-174):
```tsx
<div className="col-span-2 text-center py-12">
  <span className="text-4xl">🍽️</span>
  <p className="text-white/40 mt-2 text-sm">
    {searchQuery ? 'No items match your search' : 'No items available'}
  </p>
</div>
```

**Recommended Refactor**:
```tsx
import EmptyState from '@/components/ui/EmptyState';
import { Search, UtensilsCrossed } from 'lucide-react';

// Replace with:
{searchQuery ? (
  <div className="col-span-2">
    <EmptyState
      icon={Search}
      title="No items match your search"
      message="Try searching with different keywords or browse all items"
    />
  </div>
) : (
  <div className="col-span-2">
    <EmptyState
      icon={UtensilsCrossed}
      title="No items available"
      message="This cafeteria doesn't have any items at the moment"
    />
  </div>
)}
```

### 4. Staff Dashboard (No Orders in Column)

**Location**: `app/staff/dashboard/page.tsx`

**Current Implementation** (lines 144-145):
```tsx
{colOrders.length === 0 && (
  <div className="text-center py-8 text-white/10 text-xs">No orders</div>
)}
```

**Recommended Refactor**:
```tsx
import EmptyState from '@/components/ui/EmptyState';
import { ClipboardList } from 'lucide-react';

// Replace with:
{colOrders.length === 0 && (
  <EmptyState
    icon={ClipboardList}
    title="No orders"
    message={`No orders in ${status.toLowerCase()} status`}
  />
)}
```

## Benefits of Using EmptyState

1. **Consistency**: All empty states look and behave the same way
2. **Maintainability**: Changes to empty state design only need to be made in one place
3. **Animations**: Built-in smooth animations for better UX
4. **Accessibility**: Proper semantic HTML and keyboard navigation
5. **Design System**: Automatically uses the app's color palette and glassmorphism effects
6. **Less Code**: Reduces boilerplate in component files

## Icon Recommendations

Here are recommended Lucide icons for different contexts:

- **Empty Cart**: `ShoppingBag`
- **No Orders**: `Package` or `ClipboardList`
- **No Search Results**: `Search`
- **No Items Available**: `UtensilsCrossed` or `ChefHat`
- **No Notifications**: `Bell` or `BellOff`
- **No History**: `History` or `Clock`
- **Generic Empty**: `FileText` or `Inbox`

## Testing After Integration

After integrating EmptyState, ensure:

1. The empty state displays correctly in all contexts
2. Action buttons (if provided) navigate to the correct pages
3. Animations work smoothly
4. The component is responsive on mobile and desktop
5. Update existing tests to reflect the new component structure

## Migration Checklist

- [ ] Replace CartSheet empty state
- [ ] Replace Orders page empty state
- [ ] Replace Menu page no search results
- [ ] Replace Staff dashboard empty columns
- [ ] Update related tests
- [ ] Verify responsive design
- [ ] Test animations
- [ ] Check accessibility
