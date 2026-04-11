# Implementation Plan: Amrita Feast PWA

## Overview

This implementation plan breaks down the Amrita Feast PWA into discrete, sequential coding tasks. The project is a Next.js 14 TypeScript application with PostgreSQL database, Supabase Realtime, Cashfree payment integration, and PWA capabilities. Each task builds on previous work, with checkpoints to ensure quality and integration.

## Tasks

- [x] 1. Project foundation and configuration
  - [x] 1.1 Set up environment variables and configuration files
    - Create `.env.local` with all required environment variables (DATABASE_URL, JWT_SECRET, CASHFREE keys, SUPABASE keys, VAPID keys)
    - Configure `next.config.js` with next-pwa settings
    - Set up Tailwind config with custom warm color palette (#FF6B35, #FFB347, #FFF8F4)
    - _Requirements: 28, 40_

  - [x] 1.2 Configure Prisma schema and run migrations
    - Verify Prisma schema matches design (Student, Cafeteria, MenuItem, Order, OrderItem, Payment, Staff, PushSubscription models)
    - Run `npx prisma migrate dev` to create database tables
    - Run `npx prisma generate` to generate Prisma client
    - _Requirements: 36_

  - [x] 1.3 Create seed data for development
    - Implement `prisma/seed.ts` with 3 cafeterias (Samridhi, Canteen Main, E Block)
    - Add 20+ menu items across SNACK and COOK_TO_ORDER sections
    - Add 2-3 staff accounts with bcrypt hashed passwords
    - Include combo items and Priority Pass items
    - Run `npm run db:seed`
    - _Requirements: 4, 6, 8, 9_

- [x] 2. Core utilities and libraries
  - [x] 2.1 Implement JWT authentication utilities
    - Create `src/lib/jwt.ts` with `signToken` and `verifyToken` functions using jose library
    - Set token expiry to 7 days
    - Support both student and staff roles in JWT payload
    - _Requirements: 1, 21, 39_

  - [x] 2.2 Implement Zod validation schemas
    - Create `src/lib/validations.ts` with all validation schemas
    - Define registrationNumberSchema with pattern `/^[A-Z]{2}\.EN\.U4[A-Z]{3}\d{2}\d{3}$/`
    - Define barcodeLoginSchema, manualLoginSchema, staffLoginSchema
    - Define createOrderSchema, updateOrderStatusSchema, pushSubscriptionSchema
    - _Requirements: 1, 2, 37_

  - [x] 2.3 Set up Prisma client singleton
    - Create `src/lib/prisma.ts` with singleton Prisma client instance
    - Handle development hot reload properly
    - _Requirements: 36_

  - [x] 2.4 Set up Supabase client
    - Create `src/lib/supabase.ts` with Supabase client initialization
    - Configure for Realtime subscriptions
    - _Requirements: 18, 24_

  - [x] 2.5 Set up Cashfree integration
    - Create `src/lib/cashfree.ts` with Cashfree SDK initialization
    - Configure sandbox mode
    - Implement order creation helper function
    - _Requirements: 14_

  - [x] 2.6 Set up web-push for notifications
    - Create `src/lib/push.ts` with VAPID configuration
    - Implement `sendPushNotification` function
    - Handle subscription errors gracefully
    - _Requirements: 19, 20_

- [x] 3. Zustand state management stores
  - [x] 3.1 Create auth store
    - Create `src/store/authStore.ts` with StudentProfile state
    - Implement setStudent, logout actions
    - Add localStorage persistence
    - _Requirements: 3, 38_

  - [x] 3.2 Create cart store
    - Create `src/store/cartStore.ts` with CartItem array, cafeteriaId, cafeteriaName
    - Implement addItem, removeItem, updateQuantity, clearCart, setCafeteria actions
    - Implement getTotal, getItemCount, getItemQuantity selectors
    - Add localStorage persistence
    - Clear cart when cafeteria changes
    - _Requirements: 10, 11, 38_

  - [x] 3.3 Create order store
    - Create `src/store/orderStore.ts` with currentOrder state
    - Implement setCurrentOrder, clearCurrentOrder actions
    - No persistence (session-only)
    - _Requirements: 38_

- [x] 4. Custom React hooks
  - [x] 4.1 Implement useCountdown hook
    - Create `src/hooks/useCountdown.ts`
    - Calculate timeLeft, minutes, seconds, progress (0-100), isExpired
    - Update every second using setInterval
    - Clean up interval on unmount
    - _Requirements: 13_

  - [x] 4.2 Implement useRealtimeOrder hook
    - Create `src/hooks/useRealtimeOrder.ts`
    - Subscribe to Supabase Realtime for order updates
    - Initial fetch from API, then listen for changes
    - Return order, isLoading, error
    - Unsubscribe on unmount
    - _Requirements: 18_

  - [x] 4.3 Implement usePushNotifications hook
    - Create `src/hooks/usePushNotifications.ts`
    - Check browser support, request permission
    - Create push subscription with VAPID key
    - Send subscription to API
    - Return isSupported, isSubscribed, subscribe, unsubscribe
    - _Requirements: 19_

  - [x] 4.4 Implement usePWAInstall hook
    - Create `src/hooks/usePWAInstall.ts`
    - Listen for beforeinstallprompt event
    - Track install state, dismissal (7-day cooldown)
    - Return isInstallable, isInstalled, promptInstall, dismissPrompt
    - _Requirements: 27_

- [x] 5. Authentication API routes
  - [x] 5.1 Implement barcode login API
    - Create `app/api/auth/barcode-login/route.ts`
    - Validate barcodeData with Zod
    - Extract registration number from barcode
    - Find or create Student record
    - Generate JWT token
    - Set httpOnly cookie with secure flag
    - Return student profile
    - _Requirements: 1_

  - [x] 5.2 Implement manual login API
    - Create `app/api/auth/manual-login/route.ts`
    - Validate registrationNumber with Zod
    - Find or create Student record
    - Generate JWT token
    - Set httpOnly cookie
    - Return student profile
    - _Requirements: 2_

  - [x] 5.3 Implement staff login API
    - Create `app/api/auth/staff-login/route.ts`
    - Validate email and password with Zod
    - Find Staff record by email
    - Verify password with bcrypt
    - Generate JWT token with staff role
    - Set httpOnly cookie
    - Return staff profile
    - _Requirements: 21_

  - [x] 5.4 Implement logout API
    - Create `app/api/auth/logout/route.ts`
    - Clear authentication cookie
    - Return success response
    - _Requirements: 1, 21_

- [x] 6. Data fetching API routes
  - [x] 6.1 Implement cafeterias API
    - Create `app/api/cafeterias/route.ts`
    - Fetch all cafeterias with isOpen and avgWaitMinutes
    - Return cafeteria list
    - _Requirements: 4_

  - [x] 6.2 Implement menu API
    - Create `app/api/menu/[cafeteriaId]/route.ts`
    - Fetch menu items for specific cafeteria
    - Filter by isAvailable
    - Return menu items grouped by section
    - _Requirements: 6_

  - [x] 6.3 Implement my orders API
    - Create `app/api/orders/my/route.ts`
    - Verify JWT authentication
    - Fetch orders for authenticated student
    - Sort by createdAt descending
    - Implement pagination (20 per page)
    - Include cafeteria and items relations
    - _Requirements: 35, 39_

- [x] 7. Order creation and management
  - [x] 7.1 Implement order creation API
    - Create `app/api/orders/route.ts` POST handler
    - Verify JWT authentication
    - Validate order data with Zod
    - Generate Order_Number in format "AF-YYYY-####" with daily counter
    - Create Order with AWAITING_PAYMENT status
    - Set expiresAt to 5 minutes from now
    - Create OrderItem records
    - Return order with items
    - _Requirements: 12, 39_

  - [x] 7.2 Implement order expiry API
    - Create `app/api/orders/[id]/expire/route.ts`
    - Verify order exists and is AWAITING_PAYMENT
    - Update orderStatus to CANCELLED
    - Update paymentStatus to EXPIRED
    - Return updated order
    - _Requirements: 13_

  - [x] 7.3 Implement order status update API (staff only)
    - Create `app/api/orders/[id]/status/route.ts`
    - Verify JWT authentication with staff role
    - Validate new status with Zod
    - Update orderStatus
    - If status is CONFIRMED, assign Token_Number (daily counter)
    - Send push notification to student
    - Return updated order
    - _Requirements: 23, 39_

- [x] 8. Payment integration
  - [x] 8.1 Create Cashfree order creation endpoint
    - Add Cashfree order creation to order API
    - Generate cashfreeOrderId
    - Create Payment record with PENDING status
    - Return payment session details
    - _Requirements: 14_

  - [x] 8.2 Implement Cashfree webhook handler
    - Create `app/api/payments/cashfree-webhook/route.ts`
    - Verify webhook signature
    - Parse webhook payload
    - Update Payment status to PAID on success
    - Update Order status to CONFIRMED
    - Assign Token_Number
    - Send push notification
    - Return 200 OK
    - _Requirements: 16_

- [x] 9. Push notification API
  - [x] 9.1 Implement push subscription API
    - Create `app/api/push/subscribe/route.ts`
    - Verify JWT authentication
    - Validate subscription data with Zod
    - Store subscription in PushSubscription table
    - Return success response
    - _Requirements: 19, 39_

- [x] 10. Checkpoint - Backend APIs complete
  - Ensure all API routes are implemented and tested
  - Verify database operations work correctly
  - Test authentication flow with JWT tokens
  - Ask the user if questions arise

- [x] 11. Authentication UI components
  - [x] 11.1 Create BarcodeScanner component
    - Create `src/components/auth/BarcodeScanner.tsx`
    - Use html5-qrcode library
    - Activate rear camera on mount
    - Decode barcode within 500ms
    - Validate registration number pattern
    - Call barcode login API
    - Handle camera access denied error
    - _Requirements: 1_

  - [x] 11.2 Create ManualLoginForm component
    - Create `src/components/auth/ManualLoginForm.tsx`
    - Auto-uppercase input transformation
    - Pattern validation display
    - Bottom sheet presentation on mobile
    - Call manual login API
    - Display error messages
    - _Requirements: 2_

  - [x] 11.3 Create login page
    - Create `app/(auth)/login/page.tsx`
    - Display BarcodeScanner
    - Show "Can't scan? Enter manually" button
    - Redirect to /cafeteria on success
    - _Requirements: 1, 5_

  - [x] 11.4 Create manual login page
    - Create `app/(auth)/manual-login/page.tsx`
    - Display ManualLoginForm
    - Redirect to /cafeteria on success
    - _Requirements: 2_

  - [x] 11.5 Create staff login page
    - Create `app/staff/login/page.tsx`
    - Email and password input fields
    - Call staff login API
    - Redirect to /staff/dashboard on success
    - _Requirements: 21_

- [x] 12. Cafeteria selection UI
  - [x] 12.1 Create CafeteriaCard component with 3D effects
    - Create `src/components/cafeteria/CafeteriaCard.tsx`
    - Use React Three Fiber for 3D rendering
    - Implement mouse-based tilt animation (max 8° rotation)
    - Add gradient glow effect unique per cafeteria
    - Display name, location, open status, wait time
    - 50% opacity when closed (non-clickable)
    - Shimmer animation on hover
    - _Requirements: 4, 5_

  - [x] 12.2 Create cafeteria selection page
    - Create `app/(app)/cafeteria/page.tsx`
    - Fetch cafeterias from API
    - Display CafeteriaCard grid (1 column mobile, 2-3 desktop)
    - Show loading skeletons during fetch
    - Store selected cafeteria in cart store
    - Navigate to /menu on selection
    - _Requirements: 4, 7_

- [x] 13. Menu browsing UI
  - [x] 13.1 Create FoodCard component
    - Create `src/components/menu/FoodCard.tsx`
    - Display image with Next.js Image optimization
    - Show name, price, category, ETA
    - "Add to Cart" button with quantity badge
    - Blur effect for Priority Pass items (inactive subscription)
    - Combo badge for combo items
    - Priority Pass badge for exclusive items
    - Call cart store addItem action
    - _Requirements: 6, 9, 10_

  - [x] 13.2 Create MenuTabs component
    - Create `src/components/menu/MenuTabs.tsx`
    - Two tabs: "Ready Now" (SNACK) and "Cook to Order" (COOK_TO_ORDER)
    - Framer Motion layout animations
    - Active tab indicator
    - Item count badges
    - _Requirements: 6_

  - [x] 13.3 Create MenuSearch component
    - Create `src/components/menu/MenuSearch.tsx`
    - Real-time search filter (case-insensitive)
    - Debounced input (300ms)
    - Empty state message
    - _Requirements: 7_

  - [x] 13.4 Create ComboSection component
    - Create `src/components/menu/ComboSection.tsx`
    - Horizontal scrollable container
    - 200px fixed width cards
    - "🎁 COMBOS" badge with "Save more!" text
    - Hidden when search active
    - _Requirements: 8_

  - [x] 13.5 Create PriorityPassSection component
    - Create `src/components/menu/PriorityPassSection.tsx`
    - Gold gradient badge "⭐ PRIORITY PASS"
    - Blur filter for inactive subscriptions
    - Hidden when search active
    - _Requirements: 9_

  - [x] 13.6 Create menu page
    - Create `app/(app)/menu/page.tsx`
    - Fetch menu items for selected cafeteria
    - Display MenuTabs, MenuSearch
    - Display ComboSection, PriorityPassSection
    - Display FoodCard grid (2 columns mobile)
    - Show loading skeletons
    - _Requirements: 6, 7, 8, 9_

- [x] 14. Shopping cart UI
  - [x] 14.1 Create CartButton component
    - Create `src/components/cart/CartButton.tsx`
    - Floating action button
    - Item count badge with animation
    - Sticky positioning
    - Opens cart sheet on click
    - _Requirements: 11_

  - [x] 14.2 Create CartItem component
    - Create `src/components/cart/CartItem.tsx`
    - Display name, quantity, unit price, subtotal
    - Increment/decrement buttons
    - Remove button (quantity 0)
    - _Requirements: 11_

  - [x] 14.3 Create CartSheet component
    - Create `src/components/cart/CartSheet.tsx`
    - Bottom sheet (mobile) / Sidebar (desktop)
    - Display CartItem list
    - Total amount calculation
    - "Proceed to Checkout" button
    - Glassmorphism overlay
    - _Requirements: 11_

  - [x] 14.4 Add CartButton to menu page
    - Import CartButton in menu page
    - Display with cart store item count
    - _Requirements: 11_

- [x] 15. Checkout and payment UI
  - [x] 15.1 Create CheckoutSummary component
    - Create `src/components/checkout/CheckoutSummary.tsx`
    - Display item list with quantities
    - Show cafeteria name
    - Display total amount
    - Show order number
    - "Proceed to Payment" button
    - _Requirements: 12_

  - [x] 15.2 Create PaymentTimer component
    - Create `src/components/payment/PaymentTimer.tsx`
    - Use useCountdown hook
    - Visual progress bar
    - Second-by-second updates
    - Warning state at 1 minute remaining
    - Auto-expire on timeout
    - _Requirements: 13_

  - [x] 15.3 Create UPIPaymentInterface component
    - Create `src/components/payment/UPIPaymentInterface.tsx`
    - UPI app grid (GPay, PhonePe, Paytm, BHIM)
    - UPI ID input field
    - QR code display
    - UPI intent triggering
    - Processing animation (Lottie)
    - Success overlay with order details
    - _Requirements: 14, 15_

  - [x] 15.4 Create checkout page
    - Create `app/(app)/checkout/page.tsx`
    - Display CheckoutSummary
    - Create order via API
    - Display PaymentTimer
    - Display UPIPaymentInterface
    - Handle payment flow
    - Redirect to tracker on success
    - _Requirements: 12, 13, 14, 15_

- [x] 16. Order tracking UI
  - [x] 16.1 Create OrderTracker component
    - Create `src/components/order/OrderTracker.tsx`
    - Display Order_Number and Token_Number prominently
    - Vertical stepper with 5 stages (AWAITING_PAYMENT, CONFIRMED, PREPARING, READY, COLLECTED)
    - Highlight current status with animation
    - Glow effect on Token_Number when READY
    - Lottie animations per stage
    - Use useRealtimeOrder hook
    - _Requirements: 17, 18_

  - [x] 16.2 Create order tracker page
    - Create `app/(app)/tracker/[orderId]/page.tsx`
    - Display OrderTracker component
    - Subscribe to real-time updates
    - _Requirements: 17, 18_

  - [x] 16.3 Create payment success page
    - Create `app/(app)/success/page.tsx`
    - Display success message
    - Show order number and token number
    - Link to order tracker
    - _Requirements: 15_

- [x] 17. Order history UI
  - [x] 17.1 Create OrderCard component
    - Create `src/components/order/OrderCard.tsx`
    - Display Order_Number, cafeteria, date
    - Show total amount, final status
    - Status badge with color coding
    - Click to view tracker
    - _Requirements: 35_

  - [x] 17.2 Create orders page
    - Create `app/(app)/orders/page.tsx`
    - Fetch orders from API
    - Display OrderCard list
    - Infinite scroll pagination
    - Empty state message
    - _Requirements: 35_

- [x] 18. Staff dashboard UI
  - [x] 18.1 Create StaffOrderCard component
    - Create `src/components/staff/StaffOrderCard.tsx`
    - Display Order_Number, Token_Number
    - Show items list with quantities
    - Display total amount
    - Show time since creation
    - Status action buttons
    - Color-coded by urgency
    - _Requirements: 22, 23_

  - [x] 18.2 Create StatusActionButton component
    - Create `src/components/staff/StatusActionButton.tsx`
    - "Start Preparing" (CONFIRMED → PREPARING)
    - "Mark Ready" (PREPARING → READY)
    - "Mark Collected" (READY → COLLECTED)
    - Confirmation dialog
    - Optimistic UI update
    - Call order status API
    - _Requirements: 23_

  - [x] 18.3 Create KanbanBoard component
    - Create `src/components/staff/KanbanBoard.tsx`
    - Three columns: CONFIRMED, PREPARING, READY
    - Display StaffOrderCard in each column
    - Real-time order updates via Supabase
    - Sound notification on new order
    - _Requirements: 22, 24_

  - [x] 18.4 Create staff dashboard page
    - Create `app/staff/dashboard/page.tsx`
    - Display KanbanBoard
    - Subscribe to real-time updates
    - _Requirements: 22, 24_

- [ ] 19. Layout and navigation components
  - [x] 19.1 Create BottomNav component
    - Create `src/components/layout/BottomNav.tsx`
    - Icons: Home, Menu, Orders, Profile
    - Active state indicator
    - Safe area inset padding
    - Glassmorphism effect
    - Display on mobile only
    - _Requirements: 31_

  - [x] 19.2 Create Sidebar component
    - Create `src/components/layout/Sidebar.tsx`
    - Vertical menu
    - Active route highlighting
    - User profile section
    - Logout button
    - Display on desktop only
    - _Requirements: 31_

  - [x] 19.3 Create Header component
    - Create `src/components/layout/Header.tsx`
    - Title display
    - Back navigation
    - Search bar (menu page)
    - Cart button (menu page)
    - _Requirements: 31_

  - [x] 19.4 Create app layout
    - Create `app/(app)/layout.tsx`
    - Include Header, BottomNav, Sidebar
    - Responsive layout switching
    - _Requirements: 31_

- [ ] 20. UI components and design system
  - [x] 20.1 Create LoadingSkeleton component
    - Create `src/components/ui/LoadingSkeleton.tsx`
    - Shimmer animation
    - Match content shape
    - Used for cafeteria cards, menu items, orders
    - _Requirements: 33_

  - [x] 20.2 Create EmptyState component
    - Create `src/components/ui/EmptyState.tsx`
    - Icon display
    - Message text
    - Call-to-action button
    - Used for empty cart, no orders, no search results
    - _Requirements: 33_

  - [x] 20.3 Configure Sonner toast notifications
    - Add Sonner Toaster to root layout
    - Configure warm color palette
    - Set auto-dismiss to 4 seconds
    - Enable swipe to dismiss
    - _Requirements: 34_

  - [x] 20.4 Create global CSS with design system
    - Update `src/app/globals.css`
    - Define glassmorphism utility classes
    - Add animation keyframes
    - Configure Inter font from Google Fonts
    - _Requirements: 28, 29, 30, 32_

- [x] 21. PWA configuration
  - [x] 21.1 Create PWA manifest
    - Create `public/manifest.json`
    - Set app name to "Amrita Feast"
    - Include icons (72x72, 96x96, 128x128, 192x192, 512x512)
    - Set display mode to "standalone"
    - Set theme_color to "#FF6B35"
    - Set background_color to "#FFF8F4"
    - Define shortcuts for cafeteria selection and order tracking
    - _Requirements: 25_

  - [x] 21.2 Configure service worker with next-pwa
    - Update `next.config.js` with next-pwa configuration
    - Set cache strategies (stale-while-revalidate for API, cache-first for images)
    - Configure offline fallback
    - Enable push notification handling
    - _Requirements: 26_

  - [x] 21.3 Create PWA install prompt UI
    - Create `src/components/pwa/InstallPrompt.tsx`
    - Use usePWAInstall hook
    - Display install banner after 30 seconds
    - Show app icon, name, "Install" button
    - Trigger native install prompt
    - 7-day dismissal cooldown
    - _Requirements: 27_

  - [x] 21.4 Add PWA meta tags to root layout
    - Update `app/layout.tsx`
    - Add viewport meta tag with safe-area-inset
    - Add theme-color meta tag
    - Add apple-touch-icon links
    - _Requirements: 25, 31_

- [x] 22. Profile and subscription UI
  - [x] 22.1 Create profile page
    - Create `app/(app)/profile/page.tsx`
    - Display student registration number, name, phone
    - Show subscription status and expiry
    - Link to Priority Pass subscription page
    - Logout button
    - _Requirements: 3_

  - [x] 22.2 Create Priority Pass subscription page
    - Create `app/(app)/priority-pass/page.tsx`
    - Display subscription benefits
    - Show pricing and duration
    - "Subscribe Now" button (placeholder for future payment integration)
    - _Requirements: 3, 9_

- [ ] 23. Error handling and validation
  - [x] 23.1 Add error boundaries
    - Create error boundary components for main sections
    - Display user-friendly error messages
    - Provide retry actions
    - _Requirements: 34_

  - [x] 23.2 Add API error handling
    - Implement consistent error response format
    - Add try-catch blocks to all API routes
    - Log errors to console
    - Return appropriate status codes
    - _Requirements: 34_

  - [x] 23.3 Add client-side error handling
    - Wrap API calls with error handling
    - Display toast notifications on errors
    - Handle network errors gracefully
    - _Requirements: 34_

- [x] 24. Checkpoint - Frontend UI complete
  - Ensure all pages and components are implemented
  - Verify responsive design on mobile and desktop
  - Test navigation flows
  - Ask the user if questions arise

- [ ] 25. Integration and real-time features
  - [x] 25.1 Integrate push notifications
    - Request permission on first app access
    - Subscribe to push notifications
    - Test notification delivery on order status changes
    - Handle notification clicks to open tracker
    - _Requirements: 19, 20_

  - [x] 25.2 Test real-time order updates
    - Verify Supabase Realtime subscriptions work
    - Test order tracker updates when staff changes status
    - Test kitchen dashboard updates when new orders arrive
    - Verify sound notification on new orders
    - _Requirements: 18, 24_

  - [x] 25.3 Test payment flow end-to-end
    - Create order and verify Cashfree order creation
    - Test payment timer countdown
    - Simulate payment webhook (sandbox mode)
    - Verify order status updates to CONFIRMED
    - Verify token number assignment
    - _Requirements: 14, 15, 16_

- [ ] 26. Performance optimization
  - [x] 26.1 Optimize images
    - Ensure all images use Next.js Image component
    - Add lazy loading for menu images
    - Optimize icon sizes
    - _Requirements: 40_

  - [x] 26.2 Implement code splitting
    - Verify route-based code splitting
    - Add dynamic imports for heavy components (3D effects, Lottie)
    - _Requirements: 40_

  - [x] 26.3 Add API caching with TanStack Query
    - Wrap app with QueryClientProvider
    - Add useQuery hooks for cafeteria and menu data
    - Configure stale time and cache time
    - _Requirements: 40_

  - [x] 26.4 Add route prefetching
    - Add prefetch on hover for critical routes
    - Prefetch cafeteria data on login
    - _Requirements: 40_

- [ ] 27. Testing and quality assurance
  - [x] 27.1 Write unit tests for utilities
    - Test JWT sign and verify functions
    - Test Zod validation schemas
    - Test cart store actions (add, remove, update, clear)
    - Test auth store actions
    - Test useCountdown hook logic

  - [x] 27.2 Write integration tests for API routes
    - Test authentication endpoints
    - Test order creation and status updates
    - Test payment webhook handling
    - Test push notification subscription

  - [x] 27.3 Write component tests
    - Test FoodCard add to cart interaction
    - Test CartSheet quantity adjustment
    - Test OrderTracker status display
    - Test KanbanBoard order management

  - [x] 27.4 Manual testing checklist
    - Test barcode scanning on mobile device
    - Test PWA installation on iOS and Android
    - Test offline functionality
    - Test push notifications
    - Test payment flow in sandbox mode
    - Test real-time updates across devices
    - Test responsive design on various screen sizes

- [ ] 28. Final checkpoint and deployment preparation
  - Run Lighthouse performance audit (target: 90+)
  - Verify all environment variables are documented
  - Test database migrations on clean database
  - Verify seed data creates correct records
  - Ensure all API routes are protected with authentication
  - Test error handling for all edge cases
  - Ask the user if questions arise before deployment

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The implementation assumes TypeScript with Next.js 14 App Router
- All code should follow the design document specifications
- Use the warm color palette (#FF6B35, #FFB347, #FFF8F4) throughouhttps://example.cohttps://example.commt
- Ensure mobile-first responsive design
- Add Framer Motion animations for smooth interactions
- Use Prisma for all database operations
- Use Zod for all input validation
- Store JWT tokens in httpOnly cookies
- Test in Cashfree sandbox mode before production
