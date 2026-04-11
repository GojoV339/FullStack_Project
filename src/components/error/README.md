# Error Boundary Components

Error boundaries catch React errors in component trees and display user-friendly error messages with retry actions.

## Components

### ErrorBoundary

Base error boundary component that catches JavaScript errors anywhere in the child component tree.

**Features:**
- Catches React errors in component trees
- Displays user-friendly error messages (no technical jargon)
- Provides retry actions to recover from errors
- Uses warm color palette and glassmorphism effects
- Logs errors to console for debugging
- Shows technical details in development mode

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;        // Custom error UI
  onReset?: () => void;         // Custom reset handler
  section?: string;             // Section name for context
}
```

**Usage:**
```tsx
<ErrorBoundary section="Menu" onReset={() => window.location.reload()}>
  <MenuComponent />
</ErrorBoundary>
```

### SectionErrorBoundary

Wrapper component for main app sections with automatic retry behavior.

**Sections:**
- Cafeteria: Cafeteria selection page
- Menu: Menu browsing and cart
- Orders: Order history and tracking
- Profile: Student profile and subscription
- Staff Dashboard: Kitchen Kanban board

**Props:**
```typescript
interface SectionErrorBoundaryProps {
  children: ReactNode;
  section: 'Cafeteria' | 'Menu' | 'Orders' | 'Profile' | 'Staff Dashboard';
  onReset?: () => void;
}
```

**Usage:**
```tsx
<SectionErrorBoundary section="Menu">
  <MenuPageContent />
</SectionErrorBoundary>
```

## Implementation

Error boundaries are integrated into all main sections:

1. **Cafeteria Page** (`app/(app)/cafeteria/page.tsx`)
   - Wraps cafeteria selection UI
   - Handles errors during cafeteria data fetching

2. **Menu Page** (`app/(app)/menu/page.tsx`)
   - Wraps menu browsing and cart UI
   - Handles errors during menu data fetching

3. **Orders Page** (`app/(app)/orders/page.tsx`)
   - Wraps order history UI
   - Handles errors during order data fetching

4. **Profile Page** (`app/(app)/profile/page.tsx`)
   - Wraps profile and settings UI
   - Handles errors during profile operations

5. **Staff Dashboard** (`app/staff/dashboard/page.tsx`)
   - Wraps kitchen Kanban board
   - Handles errors during order management

## Error UI

The error UI displays:
- **Error Icon**: Red alert triangle with glow effect
- **Title**: "Oops! Something went wrong"
- **Message**: Section-specific user-friendly message
- **Try Again Button**: Resets error state and retries
- **Go to Home Button**: Navigates to cafeteria selection
- **Technical Details** (dev only): Error message and stack trace

## Design

The error UI follows the app's design system:
- **Colors**: Red error color with warm palette
- **Effects**: Glassmorphism card with backdrop blur
- **Animations**: Framer Motion entrance animations
- **Typography**: Inter font with consistent sizing
- **Responsive**: Works on mobile and desktop

## Error Handling Flow

1. Error occurs in child component
2. Error boundary catches the error
3. Error is logged to console
4. Error UI is displayed
5. User clicks "Try Again"
6. Error state is reset
7. Component tree re-renders

## Testing

Unit tests verify:
- Children render when no error occurs
- Error UI displays when error is caught
- Section-specific messages are shown
- Retry button calls onReset handler
- Custom fallback is rendered when provided
- Errors are logged to console

Run tests:
```bash
npm test -- src/components/error/__tests__/ErrorBoundary.test.tsx
```

## Best Practices

1. **Wrap main sections**: Use error boundaries at section level, not component level
2. **Provide context**: Always specify the section name for better error messages
3. **Custom reset**: Provide onReset handler for section-specific recovery logic
4. **Preserve state**: Error boundaries don't clear Zustand stores (cart, auth)
5. **Log errors**: Always log errors to console for debugging

## Limitations

Error boundaries do NOT catch:
- Errors in event handlers (use try-catch)
- Errors in async code (use try-catch)
- Errors in server-side rendering
- Errors in the error boundary itself

For these cases, use traditional try-catch blocks and display toast notifications.

## Requirements

Validates **Requirement 34**: Error Handling and Toast Notifications
- ✅ User-friendly error messages (no technical jargon)
- ✅ Retry actions to recover from errors
- ✅ Warm color palette
- ✅ Glassmorphism effects
- ✅ Error logging for debugging
