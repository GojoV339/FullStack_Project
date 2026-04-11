# Header Component

A reusable page header component with glassmorphism effects, back navigation, search functionality, and cart button support.

## Features

- **Dynamic Title Display**: Shows page title with proper truncation
- **Back Navigation**: Optional back button that uses router.back()
- **Search Bar**: Optional search input for menu filtering
- **Cart Button**: Optional cart button with item count badge
- **Glassmorphism Effect**: Consistent with app design system
- **Safe Area Support**: Handles notched devices properly
- **Responsive**: Works on mobile and desktop
- **Accessible**: Includes proper ARIA labels

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `undefined` | Page title to display |
| `showBack` | `boolean` | `true` | Show back navigation button |
| `showSearch` | `boolean` | `false` | Show search input field |
| `searchQuery` | `string` | `''` | Current search query value |
| `onSearchChange` | `(query: string) => void` | `undefined` | Callback when search input changes |
| `showCart` | `boolean` | `false` | Show cart button with item count |
| `onCartClick` | `() => void` | `undefined` | Callback when cart button is clicked |

## Usage Examples

### Basic Header with Title and Back Button

```tsx
import Header from '@/components/layout/Header';

export default function OrdersPage() {
  return (
    <div>
      <Header title="My Orders" />
      {/* Page content */}
    </div>
  );
}
```

### Header without Back Button (Home Page)

```tsx
import Header from '@/components/layout/Header';

export default function HomePage() {
  return (
    <div>
      <Header title="Choose Your Canteen" showBack={false} />
      {/* Page content */}
    </div>
  );
}
```

### Menu Page with Search and Cart

```tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  return (
    <div>
      <Header
        title="Samridhi Cafeteria"
        showSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showCart
        onCartClick={() => router.push('/checkout')}
      />
      {/* Menu items filtered by searchQuery */}
    </div>
  );
}
```

### Profile Page

```tsx
import Header from '@/components/layout/Header';

export default function ProfilePage() {
  return (
    <div>
      <Header title="My Profile" />
      {/* Profile content */}
    </div>
  );
}
```

## Styling

The Header component uses the following CSS classes from the design system:

- `glass`: Glassmorphism effect with backdrop blur
- `safe-top`: Safe area inset padding for notched devices
- `input-field`: Consistent input styling
- `gradient-primary`: Primary gradient for badges

## Accessibility

- Back button includes `aria-label="Go back"`
- Cart button includes dynamic `aria-label` with item count
- Search input includes `aria-label="Search menu items"`

## Integration with Existing Code

The Header component is designed to replace inline header implementations in pages. For example, the menu page currently has:

```tsx
// Before (inline header)
<div className="sticky top-0 z-20 glass safe-top">
  <div className="px-4 pt-4 pb-3">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <motion.button onClick={() => router.push('/cafeteria')}>
          <ArrowLeft size={22} />
        </motion.button>
        <h1>{cafeteriaName || 'Menu'}</h1>
      </div>
    </div>
    {/* Search and tabs */}
  </div>
</div>

// After (using Header component)
<Header
  title={cafeteriaName || 'Menu'}
  showSearch
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  showCart
  onCartClick={() => router.push('/checkout')}
/>
```

## Testing

The Header component includes comprehensive unit tests covering:

- Title rendering
- Back button functionality
- Search input behavior
- Cart button display and interaction
- Conditional rendering based on props
- CSS class application

Run tests with:

```bash
npm test -- src/components/layout/__tests__/Header.test.tsx
```

## Design Specifications

This component implements:

- **Requirement 31**: Responsive layout with safe area inset padding
- **Task 19.3**: Header component with title, back navigation, search, and cart button
- **Design System**: Glassmorphism effects, warm color palette, Inter font
