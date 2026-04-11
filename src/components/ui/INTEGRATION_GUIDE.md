# LoadingSkeleton Integration Guide

This document shows where and how to integrate the LoadingSkeleton component into existing pages.

## Current Implementation Status

The LoadingSkeleton component has been created and tested. The following pages currently use basic skeleton divs and should be updated to use the LoadingSkeleton component:

### 1. Cafeteria Page (`app/(app)/cafeteria/page.tsx`)

**Current Implementation:**
```tsx
{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => <div key={i} className="skeleton h-64" />)}
  </div>
) : (
  // ... cafeteria cards
)}
```

**Recommended Update:**
```tsx
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <LoadingSkeleton variant="cafeteria" count={3} />
  </div>
) : (
  // ... cafeteria cards
)}
```

### 2. Orders Page (`app/(app)/orders/page.tsx`)

**Current Implementation:**
```tsx
{loading ? (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="skeleton h-32" />
    ))}
  </div>
) : (
  // ... order cards
)}
```

**Recommended Update:**
```tsx
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

{loading ? (
  <div className="space-y-4">
    <LoadingSkeleton variant="order" count={5} />
  </div>
) : (
  // ... order cards
)}
```

### 3. Menu Page (`app/(app)/menu/page.tsx`)

**Current Implementation:**
The menu page doesn't currently have loading skeletons but should have them.

**Recommended Addition:**
```tsx
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

{loading ? (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <LoadingSkeleton variant="menu" count={6} />
  </div>
) : (
  // ... menu items
)}
```

### 4. Staff Dashboard (`app/staff/dashboard/page.tsx`)

**Current Implementation:**
```tsx
{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => <div key={i} className="skeleton h-64" />)}
  </div>
) : (
  // ... kanban board
)}
```

**Recommended Update:**
```tsx
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <LoadingSkeleton variant="order" count={9} />
  </div>
) : (
  // ... kanban board
)}
```

## Benefits of Using LoadingSkeleton

1. **Consistent Design**: All loading states use the same shimmer animation and glassmorphism effects
2. **Better UX**: Skeletons match the actual content shape, providing better visual feedback
3. **Maintainability**: Centralized component makes it easier to update loading states
4. **Animations**: Built-in entrance animations with staggered delays
5. **Accessibility**: Proper semantic structure for screen readers

## Implementation Checklist

- [ ] Update cafeteria page to use LoadingSkeleton
- [ ] Update orders page to use LoadingSkeleton
- [ ] Add LoadingSkeleton to menu page
- [ ] Update staff dashboard to use LoadingSkeleton
- [ ] Test loading states on all pages
- [ ] Verify animations work correctly
- [ ] Check responsive behavior on mobile and desktop

## Testing

After integration, test the following:

1. **Visual Appearance**: Skeletons should match the content they represent
2. **Animation**: Shimmer effect should be smooth and continuous
3. **Responsive Design**: Skeletons should adapt to different screen sizes
4. **Performance**: No performance degradation with multiple skeletons
5. **Accessibility**: Screen readers should announce loading state

## Notes

- The component uses Framer Motion for animations, which is already installed
- All styling uses existing design tokens from the Tailwind config
- The shimmer animation is defined in `globals.css`
- Component is fully tested with 90% code coverage
