# Design Document: Amrita Feast PWA

## Overview

Amrita Feast is a premium Progressive Web App designed to eliminate cafeteria queues at Amrita Vishwa Vidyapeetham, Bengaluru campus. The system provides a complete pre-ordering workflow with real-time order tracking, UPI payment integration, and a kitchen management dashboard.

### Core Features

- Barcode-based student authentication with manual fallback
- Multi-cafeteria menu browsing with real-time availability
- Shopping cart with cross-cafeteria validation
- Cashfree UPI payment integration with 5-minute expiry timer
- Real-time order status tracking via Supabase Realtime
- Push notifications for order updates
- Kitchen staff dashboard with Kanban-style order management
- PWA capabilities with offline support and home screen installation

### Technology Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Supabase Realtime for order status updates
- **Payment**: Cashfree Payments (UPI integration)
- **State Management**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS with custom warm color palette
- **Animations**: Framer Motion for micro-interactions
- **3D Effects**: React Three Fiber for cafeteria card animations
- **PWA**: next-pwa with Workbox for service worker
- **Validation**: Zod for runtime input validation
- **Authentication**: JWT tokens (jose library) with httpOnly cookies
- **Push Notifications**: web-push library with VAPID keys
- **Barcode Scanning**: html5-qrcode library
- **UI Components**: Custom components with glassmorphism effects
- **Notifications**: Sonner for toast notifications

### Design Principles

1. **Mobile-First**: Optimized for smartphone usage with responsive desktop support
2. **Premium Experience**: Warm food colors, smooth animations, glassmorphism effects
3. **Real-Time**: Live order updates without page refresh
4. **Offline-Ready**: Service worker caching for menu browsing
5. **Performance**: Code splitting, image optimization, API caching
6. **Security**: JWT authentication, input validation, webhook verification

## Architecture

### System Architecture

The application follows a modern serverless architecture with Next.js API routes handling backend logic:

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Student    │  │    Staff     │  │  Service     │      │
│  │     PWA      │  │  Dashboard   │  │   Worker     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  API Routes  │  │  Middleware  │      │
│  │  (RSC/SSR)   │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Prisma     │  │   Supabase   │  │   Cashfree   │
│   Client     │  │   Realtime   │  │   Payments   │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │  WebSocket   │  │  UPI Gateway │
│   Database   │  │   Server     │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Application Flow

#### Student Order Flow
1. Student scans barcode or enters registration number
2. JWT token created and stored in httpOnly cookie
3. Student selects cafeteria from available options
4. Student browses menu and adds items to cart
5. Student proceeds to checkout, order created with AWAITING_PAYMENT status
6. 5-minute countdown timer starts
7. Student completes UPI payment via Cashfree
8. Webhook updates order to CONFIRMED status
9. Student redirected to real-time order tracker
10. Push notifications sent on status changes
11. Student collects order when status is READY

#### Staff Order Management Flow
1. Staff logs in with email/password
2. Dashboard displays Kanban board with three columns
3. New orders appear in CONFIRMED column with sound notification
4. Staff clicks "Start Preparing" to move to PREPARING column
5. Staff clicks "Mark Ready" to move to READY column
6. Staff clicks "Mark Collected" to complete order
7. Push notification sent to student on each status change

### Routing Structure

```
/                           → Landing page (redirect to /login or /cafeteria)
/login                      → Barcode scanner login
/manual-login               → Manual registration number entry
/cafeteria                  → Cafeteria selection page
/menu                       → Menu browsing with cart
/checkout                   → Order review and payment
/tracker/[orderId]          → Real-time order status tracking
/orders                     → Order history
/profile                    → Student profile and subscription
/priority-pass              → Priority Pass subscription page
/success                    → Payment success page

/staff/login                → Staff authentication
/staff/dashboard            → Kitchen Kanban board

/api/auth/barcode-login     → POST: Authenticate via barcode
/api/auth/manual-login      → POST: Authenticate via registration number
/api/auth/staff-login       → POST: Staff authentication
/api/auth/logout            → POST: Clear authentication cookie
/api/cafeterias             → GET: Fetch all cafeterias
/api/menu/[cafeteriaId]     → GET: Fetch menu items for cafeteria
/api/orders                 → POST: Create new order
/api/orders/my              → GET: Fetch student's orders
/api/orders/[id]/status     → PATCH: Update order status (staff only)
/api/orders/[id]/expire     → POST: Expire order after timer
/api/payments/cashfree-webhook → POST: Handle payment confirmation
/api/push/subscribe         → POST: Register push notification subscription
```

## Components and Interfaces

### Client Components

#### Authentication Components
- **BarcodeScanner**: HTML5 camera interface for barcode scanning
  - Uses html5-qrcode library
  - Activates rear camera on mount
  - Decodes barcode within 500ms
  - Validates registration number pattern
  - Triggers authentication API call

- **ManualLoginForm**: Fallback registration number input
  - Auto-uppercase text transformation
  - Pattern validation: `/^[A-Z]{2}\.EN\.U4[A-Z]{3}\d{2}\d{3}$/`
  - Bottom sheet presentation on mobile
  - Error display for invalid format

#### Cafeteria Components
- **CafeteriaCard**: 3D animated cafeteria selection card
  - React Three Fiber for 3D effects
  - Mouse-based tilt animation (max 8° rotation)
  - Gradient glow effect unique per cafeteria
  - Shimmer animation on hover
  - Displays: name, location, open status, wait time
  - 50% opacity when closed (non-clickable)

- **CafeteriaGrid**: Grid layout for cafeteria cards
  - Fetches real-time cafeteria data
  - Responsive grid (1 column mobile, 2-3 desktop)
  - Loading skeletons during fetch

#### Menu Components
- **MenuTabs**: Section switcher for SNACK vs COOK_TO_ORDER
  - Framer Motion layout animations
  - Active tab indicator
  - Item count badges

- **MenuSearch**: Real-time search filter
  - Case-insensitive name matching
  - Debounced input (300ms)
  - Empty state message

- **FoodCard**: Menu item display card
  - Image with Next.js Image optimization
  - Name, price, category, ETA display
  - "Add to Cart" button with quantity badge
  - Blur effect for Priority Pass items (inactive subscription)
  - Combo badge for combo items
  - Priority Pass badge for exclusive items

- **ComboSection**: Horizontal scrollable combo deals
  - 200px fixed width cards
  - "Save more!" badge
  - Hidden when search active

- **PriorityPassSection**: Exclusive items section
  - Gold gradient badge
  - Blur filter for inactive subscriptions
  - Hidden when search active

#### Cart Components
- **CartButton**: Floating action button
  - Item count badge with animation
  - Sticky positioning
  - Opens cart sheet on click

- **CartSheet**: Bottom sheet (mobile) / Sidebar (desktop)
  - Item list with quantity controls
  - Increment/decrement buttons
  - Remove item on quantity 0
  - Total amount calculation
  - "Proceed to Checkout" button
  - Glassmorphism overlay

- **CartItem**: Individual cart item row
  - Name, quantity, unit price, subtotal
  - Quantity adjustment buttons
  - Remove button

#### Order Components
- **CheckoutSummary**: Order review before payment
  - Item list with quantities
  - Cafeteria name
  - Total amount
  - Order number display
  - "Proceed to Payment" button

- **PaymentTimer**: 5-minute countdown display
  - useCountdown hook
  - Visual progress bar
  - Second-by-second updates
  - Auto-expire on timeout
  - Warning state at 1 minute remaining

- **UPIPaymentInterface**: Payment method selection
  - UPI app grid (GPay, PhonePe, Paytm, BHIM)
  - UPI ID input field
  - QR code display
  - UPI intent triggering
  - Processing animation (Lottie)
  - Success overlay with order details

- **OrderTracker**: Real-time status display
  - Order number and token number
  - Vertical stepper with 5 stages
  - Lottie animations per stage
  - Glow effect on token when READY
  - useRealtimeOrder hook for live updates
  - Auto-refresh on status change

- **OrderCard**: Order history item
  - Order number, cafeteria, date
  - Total amount, final status
  - Click to view tracker
  - Status badge with color coding

#### Staff Components
- **KanbanBoard**: Three-column order management
  - Columns: CONFIRMED, PREPARING, READY
  - Real-time order updates
  - Sound notification on new order
  - Drag-and-drop (future enhancement)

- **StaffOrderCard**: Order display in Kanban
  - Order number, token number
  - Items list with quantities
  - Total amount
  - Time since creation
  - Status action buttons
  - Color-coded by urgency

- **StatusActionButton**: Order status update trigger
  - "Start Preparing" (CONFIRMED → PREPARING)
  - "Mark Ready" (PREPARING → READY)
  - "Mark Collected" (READY → COLLECTED)
  - Confirmation dialog
  - Optimistic UI update

#### Layout Components
- **BottomNav**: Mobile navigation bar
  - Icons: Home, Menu, Orders, Profile
  - Active state indicator
  - Safe area inset padding
  - Glassmorphism effect

- **Sidebar**: Desktop navigation
  - Vertical menu
  - Active route highlighting
  - User profile section
  - Logout button

- **Header**: Page header with back button
  - Title display
  - Back navigation
  - Search bar (menu page)
  - Cart button (menu page)

#### UI Components
- **LoadingSkeleton**: Content placeholder
  - Shimmer animation
  - Matches content shape
  - Used for: cafeteria cards, menu items, orders

- **EmptyState**: No content message
  - Icon display
  - Message text
  - Call-to-action button
  - Used for: empty cart, no orders, no search results

- **Toast**: Notification display (Sonner)
  - Success, error, info variants
  - Warm color palette
  - Auto-dismiss (4s)
  - Swipe to dismiss

### Custom Hooks

#### useCountdown
```typescript
interface UseCountdownReturn {
  timeLeft: number;
  isExpired: boolean;
  minutes: number;
  seconds: number;
  progress: number; // 0-100
}

function useCountdown(expiresAt: Date): UseCountdownReturn
```
- Calculates time remaining until expiry
- Updates every second
- Returns formatted minutes/seconds
- Progress percentage for visual indicator
- isExpired flag for auto-actions

#### useRealtimeOrder
```typescript
interface UseRealtimeOrderReturn {
  order: Order | null;
  isLoading: boolean;
  error: Error | null;
}

function useRealtimeOrder(orderId: string): UseRealtimeOrderReturn
```
- Subscribes to Supabase Realtime for order updates
- Initial fetch from API
- Live updates on status changes
- Auto-unsubscribe on unmount
- Error handling for connection issues

#### usePushNotifications
```typescript
interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

function usePushNotifications(): UsePushNotificationsReturn
```
- Checks browser push notification support
- Requests permission
- Creates push subscription with VAPID key
- Sends subscription to API
- Manages subscription state

#### usePWAInstall
```typescript
interface UsePWAInstallReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
  dismissPrompt: () => void;
}

function usePWAInstall(): UsePWAInstallReturn
```
- Listens for beforeinstallprompt event
- Tracks install state
- Triggers native install prompt
- Dismissal tracking (7-day cooldown)
- Detects if already installed

### API Route Handlers

All API routes follow this structure:
- Input validation with Zod schemas
- JWT authentication verification
- Database operations via Prisma
- Error handling with appropriate status codes
- JSON response formatting

#### Authentication Routes
- **POST /api/auth/barcode-login**: Decode barcode, validate registration number, create JWT
- **POST /api/auth/manual-login**: Validate registration number, create JWT
- **POST /api/auth/staff-login**: Verify email/password (bcrypt), create JWT with staff role
- **POST /api/auth/logout**: Clear authentication cookie

#### Data Routes
- **GET /api/cafeterias**: Fetch all cafeterias with open status and wait times
- **GET /api/menu/[cafeteriaId]**: Fetch menu items for specific cafeteria
- **GET /api/orders/my**: Fetch authenticated student's orders (paginated)
- **POST /api/orders**: Create new order with AWAITING_PAYMENT status
- **PATCH /api/orders/[id]/status**: Update order status (staff only)
- **POST /api/orders/[id]/expire**: Expire order after payment timer

#### Payment Routes
- **POST /api/payments/cashfree-webhook**: Verify signature, update payment and order status

#### Push Notification Routes
- **POST /api/push/subscribe**: Store push subscription for student

## Data Models

### Database Schema (Prisma)

```prisma
model Student {
  id                 String    @id @default(uuid())
  registrationNumber String    @unique
  name               String?
  phone              String?
  subscriptionStatus SubStatus @default(INACTIVE)
  subscriptionExpiry DateTime?
  cashfreeCustomerId String?
  pushSubscription   String?
  createdAt          DateTime  @default(now())
  orders             Order[]
  payments           Payment[]
}

model Cafeteria {
  id             String     @id @default(uuid())
  name           String
  location       String
  isOpen         Boolean    @default(true)
  avgWaitMinutes Int        @default(10)
  menuItems      MenuItem[]
  orders         Order[]
}

model MenuItem {
  id             String      @id @default(uuid())
  cafeteriaId    String
  cafeteria      Cafeteria   @relation(fields: [cafeteriaId], references: [id])
  name           String
  section        FoodSection
  category       String
  price          Decimal     @db.Decimal(8, 2)
  imageUrl       String?
  etaMinutes     Int         @default(0)
  isCombo        Boolean     @default(false)
  isPriorityOnly Boolean     @default(false)
  isAvailable    Boolean     @default(true)
  orderItems     OrderItem[]
}

model Order {
  id            String        @id @default(uuid())
  studentId     String
  student       Student       @relation(fields: [studentId], references: [id])
  cafeteriaId   String
  cafeteria     Cafeteria     @relation(fields: [cafeteriaId], references: [id])
  tokenNumber   Int
  totalAmount   Decimal       @db.Decimal(8, 2)
  paymentStatus PaymentStatus @default(PENDING)
  orderStatus   OrderStatus   @default(AWAITING_PAYMENT)
  expiresAt     DateTime
  createdAt     DateTime      @default(now())
  items         OrderItem[]
  payment       Payment?
}

model OrderItem {
  id         String   @id @default(uuid())
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id])
  menuItemId String
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id])
  quantity   Int
  unitPrice  Decimal  @db.Decimal(8, 2)
}

model Payment {
  id                String        @id @default(uuid())
  orderId           String        @unique
  order             Order         @relation(fields: [orderId], references: [id])
  studentId         String
  student           Student       @relation(fields: [studentId], references: [id])
  type              PaymentType
  cashfreeOrderId   String?
  cashfreePaymentId String?
  status            PaymentStatus @default(PENDING)
  amount            Decimal       @db.Decimal(8, 2)
  createdAt         DateTime      @default(now())
}

model Staff {
  id          String   @id @default(uuid())
  name        String
  email       String   @unique
  password    String
  cafeteriaId String
  createdAt   DateTime @default(now())
}

model PushSubscription {
  id           String   @id @default(uuid())
  studentId    String   @unique
  subscription String
  createdAt    DateTime @default(now())
}

enum SubStatus {
  ACTIVE
  INACTIVE
}

enum FoodSection {
  SNACK
  COOK_TO_ORDER
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  EXPIRED
}

enum OrderStatus {
  AWAITING_PAYMENT
  CONFIRMED
  PREPARING
  READY
  COLLECTED
  CANCELLED
}

enum PaymentType {
  ORDER
  SUBSCRIPTION
}
```

### TypeScript Interfaces

```typescript
interface StudentProfile {
  id: string;
  registrationNumber: string;
  name: string | null;
  phone: string | null;
  subscriptionStatus: 'ACTIVE' | 'INACTIVE';
  subscriptionExpiry: Date | null;
}

interface CafeteriaData {
  id: string;
  name: string;
  location: string;
  isOpen: boolean;
  avgWaitMinutes: number;
}

interface MenuItemData {
  id: string;
  cafeteriaId: string;
  name: string;
  section: 'SNACK' | 'COOK_TO_ORDER';
  category: string;
  price: number;
  imageUrl: string | null;
  etaMinutes: number;
  isCombo: boolean;
  isPriorityOnly: boolean;
  isAvailable: boolean;
}

interface CartItem {
  menuItem: MenuItemData;
  quantity: number;
}

interface OrderData {
  id: string;
  studentId: string;
  cafeteriaId: string;
  tokenNumber: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  orderStatus: 'AWAITING_PAYMENT' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COLLECTED' | 'CANCELLED';
  expiresAt: Date;
  createdAt: Date;
  items: OrderItemData[];
  cafeteria: CafeteriaData;
}

interface OrderItemData {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  menuItem: MenuItemData;
}

interface JWTPayload {
  sub: string; // studentId or staffId
  role: 'student' | 'staff';
  registrationNumber?: string;
  cafeteriaId?: string; // for staff
}

interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  order_status: string;
  payment_session_id: string;
}

interface CashfreeWebhookPayload {
  type: string;
  data: {
    order: {
      order_id: string;
      order_amount: number;
      order_status: string;
    };
    payment: {
      cf_payment_id: string;
      payment_status: string;
      payment_amount: number;
    };
  };
}
```

### Zustand Store Schemas

```typescript
// Auth Store
interface AuthState {
  student: StudentProfile | null;
  isAuthenticated: boolean;
  setStudent: (student: StudentProfile) => void;
  logout: () => void;
}

// Cart Store
interface CartState {
  items: CartItem[];
  cafeteriaId: string | null;
  cafeteriaName: string | null;
  addItem: (menuItem: MenuItemData) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  setCafeteria: (id: string, name: string) => void;
  getTotal: () => number;
  getItemCount: () => number;
  getItemQuantity: (menuItemId: string) => number;
}

// Order Store (no persistence)
interface OrderState {
  currentOrder: OrderData | null;
  setCurrentOrder: (order: OrderData) => void;
  clearCurrentOrder: () => void;
}
```

### Validation Schemas (Zod)

```typescript
const registrationNumberSchema = z.string().regex(
  /^[A-Z]{2}\.EN\.U4[A-Z]{3}\d{2}\d{3}$/,
  'Invalid registration number format'
);

const barcodeLoginSchema = z.object({
  barcodeData: z.string().min(1),
});

const manualLoginSchema = z.object({
  registrationNumber: registrationNumberSchema,
});

const staffLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const createOrderSchema = z.object({
  cafeteriaId: z.string().uuid(),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
});

const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(['CONFIRMED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED']),
});

const pushSubscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});
```


## Error Handling

### Error Categories

#### Authentication Errors
- **Invalid Barcode**: Display "Invalid registration number format" toast
- **Camera Access Denied**: Show manual login fallback button
- **Token Expired**: Clear auth state, redirect to login with "Session expired" message
- **Unauthorized Access**: Return 401 with "Unauthorized" message

#### Validation Errors
- **Invalid Input Format**: Return 400 with field-specific error messages
- **Empty Cart**: Prevent checkout, show "Add items to cart" toast
- **Expired Order**: Display "Order expired. Please try again." message
- **Invalid Order Status Transition**: Return 400 with "Invalid status transition" message

#### Payment Errors
- **Payment Timeout**: Auto-expire order, show "Payment time expired" message
- **Payment Failed**: Display "Payment failed. Please try again." with retry button
- **Webhook Signature Invalid**: Return 401, log security event
- **Cashfree API Error**: Display "Payment service unavailable" with support contact

#### Network Errors
- **API Request Failed**: Display "Connection error. Please try again." toast
- **Realtime Connection Lost**: Show "Reconnecting..." indicator, auto-retry
- **Offline Mode**: Display "You're offline" banner, serve cached data if available

#### Data Errors
- **Cafeteria Not Found**: Return 404 with "Cafeteria not found" message
- **Menu Item Not Found**: Return 404 with "Item not found" message
- **Order Not Found**: Return 404 with "Order not found" message
- **Insufficient Stock**: Display "Item currently unavailable" toast

### Error Handling Strategy

#### Client-Side Error Handling
```typescript
// API call wrapper with error handling
async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred');
    }
    throw error;
  }
}
```

#### API Route Error Handling
```typescript
// Standardized error response
function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

// Try-catch wrapper for route handlers
export async function POST(request: Request) {
  try {
    // Validation
    const body = await request.json();
    const validated = schema.parse(body);
    
    // Business logic
    const result = await processRequest(validated);
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        error.errors[0].message,
        400
      );
    }
    
    if (error instanceof Error) {
      console.error('API Error:', error);
      return errorResponse(
        'Internal server error',
        500
      );
    }
    
    return errorResponse('Unknown error', 500);
  }
}
```

#### Realtime Error Handling
```typescript
// Supabase Realtime error handling
const subscription = supabase
  .channel(`order:${orderId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'Order',
    filter: `id=eq.${orderId}`,
  }, (payload) => {
    setOrder(payload.new);
  })
  .on('error', (error) => {
    console.error('Realtime error:', error);
    toast.error('Connection lost. Reconnecting...');
    // Auto-retry logic
    setTimeout(() => {
      subscription.subscribe();
    }, 3000);
  })
  .subscribe();
```

#### Push Notification Error Handling
```typescript
// Graceful degradation for push notifications
async function sendPushNotification(
  studentId: string,
  message: string
) {
  try {
    const subscription = await prisma.pushSubscription.findUnique({
      where: { studentId },
    });
    
    if (!subscription) {
      // User hasn't subscribed, skip silently
      return;
    }
    
    await webpush.sendNotification(
      JSON.parse(subscription.subscription),
      message
    );
  } catch (error) {
    // Log error but don't block order processing
    console.error('Push notification failed:', error);
    
    // Remove invalid subscription
    if (error.statusCode === 410) {
      await prisma.pushSubscription.delete({
        where: { studentId },
      });
    }
  }
}
```

### Error Logging

- **Client Errors**: Log to browser console with context
- **API Errors**: Log to server console with request details
- **Payment Errors**: Log with order ID and student ID for support
- **Security Events**: Log webhook signature failures with IP address

### User-Friendly Error Messages

- Avoid technical jargon
- Provide actionable next steps
- Use warm, supportive tone
- Include support contact for critical errors

## Testing Strategy

### Testing Approach

The Amrita Feast PWA requires a comprehensive testing strategy that combines unit tests, integration tests, and end-to-end tests. Given the nature of this application—which heavily involves UI interactions, external service integrations (Cashfree, Supabase), real-time updates, and PWA features—property-based testing is NOT the primary testing approach.

### Why Property-Based Testing is Limited Here

Property-based testing (PBT) is most effective for:
- Pure functions with clear input/output behavior
- Algorithms and data transformations
- Parsers and serializers

However, Amrita Feast is primarily:
- **UI-heavy**: React components with user interactions
- **Integration-focused**: Payment gateways, real-time databases, push notifications
- **Side-effect driven**: Database writes, external API calls, webhook handling
- **Configuration-based**: PWA manifest, service worker setup

Therefore, the testing strategy focuses on:
1. **Unit tests** for business logic and utility functions
2. **Integration tests** for API routes and database operations
3. **Component tests** for React components with user interactions
4. **E2E tests** for critical user flows
5. **Manual testing** for PWA features and payment flows

### Unit Testing

#### Test Framework
- **Jest** for test runner
- **React Testing Library** for component testing
- **MSW (Mock Service Worker)** for API mocking

#### What to Unit Test

**Utility Functions**
- JWT token signing and verification
- Registration number validation
- Order number generation (AF-YYYY-####)
- Token number generation (daily counter)
- Price calculations
- Time formatting

**Custom Hooks**
- `useCountdown`: Timer logic, expiry detection
- `usePWAInstall`: Install prompt state management
- `usePushNotifications`: Subscription state management

**Zustand Stores**
- `authStore`: Login, logout, state persistence
- `cartStore`: Add/remove items, quantity updates, total calculation, cafeteria switching
- `orderStore`: Order state management

**Validation Schemas**
- Zod schema validation for all input types
- Registration number pattern matching
- Order creation validation

#### Example Unit Tests

```typescript
// JWT utility tests
describe('JWT utilities', () => {
  it('should create valid JWT token with 7-day expiry', async () => {
    const payload = { sub: 'student-123', role: 'student' };
    const token = await signToken(payload);
    const verified = await verifyToken(token);
    expect(verified?.sub).toBe('student-123');
  });
  
  it('should reject expired tokens', async () => {
    // Test with mocked expired token
  });
});

// Cart store tests
describe('Cart Store', () => {
  it('should add item to empty cart', () => {
    const { addItem, items } = useCartStore.getState();
    addItem(mockMenuItem);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
  });
  
  it('should increment quantity for existing item', () => {
    const { addItem, items } = useCartStore.getState();
    addItem(mockMenuItem);
    addItem(mockMenuItem);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });
  
  it('should clear cart when switching cafeterias', () => {
    const { addItem, setCafeteria, items } = useCartStore.getState();
    addItem(mockMenuItem);
    setCafeteria('different-cafeteria-id', 'Different Cafeteria');
    expect(items).toHaveLength(0);
  });
  
  it('should calculate total correctly', () => {
    const { addItem, getTotal } = useCartStore.getState();
    addItem({ ...mockMenuItem, price: 50 });
    addItem({ ...mockMenuItem, price: 30 });
    expect(getTotal()).toBe(80);
  });
});

// Validation tests
describe('Registration Number Validation', () => {
  it('should accept valid registration number', () => {
    const result = registrationNumberSchema.safeParse('AM.EN.U4CSE21001');
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid format', () => {
    const result = registrationNumberSchema.safeParse('INVALID');
    expect(result.success).toBe(false);
  });
});
```

### Integration Testing

#### What to Integration Test

**API Routes**
- Authentication endpoints (barcode, manual, staff login)
- Cafeteria and menu data fetching
- Order creation and status updates
- Payment webhook handling
- Push notification subscription

**Database Operations**
- Student creation and lookup
- Order creation with items
- Order status transitions
- Payment record creation
- Token number generation (daily counter reset)

**External Service Integration**
- Cashfree order creation (sandbox mode)
- Supabase Realtime subscription setup
- Push notification delivery (with test subscription)

#### Example Integration Tests

```typescript
// API route tests
describe('POST /api/auth/barcode-login', () => {
  it('should authenticate valid registration number', async () => {
    const response = await fetch('/api/auth/barcode-login', {
      method: 'POST',
      body: JSON.stringify({ barcodeData: 'AM.EN.U4CSE21001' }),
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.student).toBeDefined();
  });
  
  it('should reject invalid registration number', async () => {
    const response = await fetch('/api/auth/barcode-login', {
      method: 'POST',
      body: JSON.stringify({ barcodeData: 'INVALID' }),
    });
    expect(response.status).toBe(400);
  });
});

describe('POST /api/orders', () => {
  it('should create order with correct token number', async () => {
    // Create first order of the day
    const response1 = await createOrder(mockOrderData);
    expect(response1.tokenNumber).toBe(1);
    
    // Create second order
    const response2 = await createOrder(mockOrderData);
    expect(response2.tokenNumber).toBe(2);
  });
  
  it('should set expiry to 5 minutes from creation', async () => {
    const response = await createOrder(mockOrderData);
    const expiryTime = new Date(response.expiresAt).getTime();
    const expectedExpiry = Date.now() + 5 * 60 * 1000;
    expect(expiryTime).toBeCloseTo(expectedExpiry, -3);
  });
});

describe('POST /api/payments/cashfree-webhook', () => {
  it('should update order status on successful payment', async () => {
    const order = await createOrder(mockOrderData);
    
    const webhookPayload = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: { order_id: order.id, order_status: 'PAID' },
        payment: { cf_payment_id: 'cf-123', payment_status: 'SUCCESS' },
      },
    };
    
    const signature = generateWebhookSignature(webhookPayload);
    
    const response = await fetch('/api/payments/cashfree-webhook', {
      method: 'POST',
      headers: { 'x-webhook-signature': signature },
      body: JSON.stringify(webhookPayload),
    });
    
    expect(response.status).toBe(200);
    
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
    });
    expect(updatedOrder?.orderStatus).toBe('CONFIRMED');
    expect(updatedOrder?.paymentStatus).toBe('PAID');
  });
  
  it('should reject webhook with invalid signature', async () => {
    const response = await fetch('/api/payments/cashfree-webhook', {
      method: 'POST',
      headers: { 'x-webhook-signature': 'invalid-signature' },
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(401);
  });
});
```

### Component Testing

#### What to Component Test

**Interactive Components**
- BarcodeScanner: Camera activation, barcode detection
- ManualLoginForm: Input validation, form submission
- FoodCard: Add to cart interaction, quantity display
- CartSheet: Quantity adjustment, item removal
- PaymentTimer: Countdown display, expiry handling
- OrderTracker: Status display, real-time updates
- KanbanBoard: Order display, status updates

#### Example Component Tests

```typescript
describe('FoodCard', () => {
  it('should display menu item details', () => {
    render(<FoodCard item={mockMenuItem} />);
    expect(screen.getByText(mockMenuItem.name)).toBeInTheDocument();
    expect(screen.getByText(`₹${mockMenuItem.price}`)).toBeInTheDocument();
  });
  
  it('should add item to cart on button click', () => {
    const { addItem } = useCartStore.getState();
    render(<FoodCard item={mockMenuItem} />);
    
    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);
    
    expect(addItem).toHaveBeenCalledWith(mockMenuItem);
  });
  
  it('should blur Priority Pass items for inactive subscription', () => {
    const priorityItem = { ...mockMenuItem, isPriorityOnly: true };
    const { student } = useAuthStore.getState();
    student.subscriptionStatus = 'INACTIVE';
    
    render(<FoodCard item={priorityItem} />);
    const card = screen.getByTestId('food-card');
    expect(card).toHaveClass('blur-sm');
  });
});

describe('CartSheet', () => {
  it('should display cart items with quantities', () => {
    const { addItem } = useCartStore.getState();
    addItem(mockMenuItem);
    
    render(<CartSheet isOpen={true} />);
    expect(screen.getByText(mockMenuItem.name)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
  
  it('should update quantity on increment', () => {
    const { addItem, updateQuantity } = useCartStore.getState();
    addItem(mockMenuItem);
    
    render(<CartSheet isOpen={true} />);
    const incrementButton = screen.getByLabelText('Increment');
    fireEvent.click(incrementButton);
    
    expect(updateQuantity).toHaveBeenCalledWith(mockMenuItem.id, 2);
  });
  
  it('should remove item when quantity reaches 0', () => {
    const { addItem, updateQuantity } = useCartStore.getState();
    addItem(mockMenuItem);
    
    render(<CartSheet isOpen={true} />);
    const decrementButton = screen.getByLabelText('Decrement');
    fireEvent.click(decrementButton);
    
    expect(updateQuantity).toHaveBeenCalledWith(mockMenuItem.id, 0);
  });
});
```

### End-to-End Testing

#### Test Framework
- **Playwright** or **Cypress** for E2E testing

#### Critical User Flows to Test

1. **Student Order Flow**
   - Login via barcode scan
   - Select cafeteria
   - Browse menu and add items to cart
   - Proceed to checkout
   - Complete payment (sandbox mode)
   - View order tracker
   - Receive status updates

2. **Staff Order Management Flow**
   - Staff login
   - View Kanban board
   - Update order status (CONFIRMED → PREPARING → READY → COLLECTED)
   - Verify real-time updates

3. **Payment Expiry Flow**
   - Create order
   - Wait for 5-minute timer to expire
   - Verify order status changes to CANCELLED

4. **PWA Installation Flow**
   - Visit app on mobile browser
   - See install prompt
   - Install to home screen
   - Launch from home screen

### Manual Testing

#### PWA Features
- Service worker registration
- Offline functionality (cached menu browsing)
- Push notification delivery
- Home screen installation
- Splash screen display
- Standalone mode behavior

#### Payment Integration
- UPI app intent triggering
- QR code scanning
- Payment success/failure flows
- Webhook delivery in production

#### Real-Time Features
- Order status updates across devices
- Kitchen dashboard live updates
- Push notification timing

#### Cross-Browser Testing
- Chrome (Android/iOS)
- Safari (iOS)
- Firefox (Android)
- Samsung Internet

#### Device Testing
- Various screen sizes (320px - 1920px)
- Notched devices (safe area insets)
- Different network conditions (3G, 4G, WiFi)

### Performance Testing

#### Metrics to Monitor
- Lighthouse performance score (target: 90+)
- First Contentful Paint (target: < 1.5s)
- Time to Interactive (target: < 3s)
- Bundle size (target: < 200KB initial)
- API response times (target: < 500ms)

#### Load Testing
- Concurrent order creation (100+ students)
- Real-time update delivery (multiple staff members)
- Database query performance (order history pagination)

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage for utilities and stores
- **Integration Tests**: All API routes covered
- **Component Tests**: All interactive components covered
- **E2E Tests**: Critical user flows covered

### Continuous Integration

- Run unit and integration tests on every commit
- Run E2E tests on pull requests
- Performance testing on staging environment
- Manual PWA testing before production deployment


## Design Summary

### Key Design Decisions

#### 1. Authentication Strategy
- **Barcode scanning** as primary authentication method for speed and convenience
- **Manual fallback** ensures accessibility when camera fails
- **JWT tokens** with 7-day expiry stored in httpOnly cookies for security
- **Separate staff authentication** with email/password for kitchen access

#### 2. Real-Time Architecture
- **Supabase Realtime** for order status updates eliminates polling overhead
- **WebSocket connections** provide sub-second update latency
- **Push notifications** ensure students are notified even when app is closed
- **Optimistic UI updates** for instant feedback on staff actions

#### 3. Payment Integration
- **Cashfree sandbox mode** for development and testing
- **5-minute payment timer** prevents inventory blocking
- **Webhook-based confirmation** ensures reliable payment status updates
- **UPI intent support** for seamless payment app integration

#### 4. State Management
- **Zustand with persistence** for auth and cart state across sessions
- **TanStack Query** for API request caching and deduplication
- **Local-first approach** with optimistic updates for better UX

#### 5. PWA Implementation
- **next-pwa with Workbox** for service worker generation
- **Stale-while-revalidate** strategy for menu data caching
- **Cache-first** strategy for food images
- **Push notification support** via web-push library

#### 6. UI/UX Design
- **Warm color palette** (saffron-orange, turmeric yellow) for appetizing feel
- **Glassmorphism effects** for modern, premium appearance
- **Framer Motion animations** for smooth micro-interactions
- **React Three Fiber** for 3D cafeteria card effects
- **Mobile-first responsive design** with bottom nav on mobile, sidebar on desktop

#### 7. Performance Optimization
- **Next.js Image component** for automatic image optimization
- **Route-based code splitting** for smaller initial bundle
- **API response caching** with TanStack Query
- **Lazy loading** for menu images as they enter viewport
- **Prefetching** critical routes on hover

### Architecture Highlights

#### Separation of Concerns
- **Client components** handle UI and user interactions
- **API routes** handle business logic and database operations
- **Custom hooks** encapsulate reusable logic (countdown, realtime, push)
- **Zustand stores** manage global state
- **Utility libraries** handle JWT, validation, payment integration

#### Data Flow
1. User interacts with client component
2. Component calls Zustand store action or API route
3. API route validates input with Zod
4. API route performs database operation via Prisma
5. API route returns response
6. Component updates UI based on response
7. Realtime updates trigger automatic UI refresh

#### Security Measures
- JWT tokens in httpOnly cookies (not localStorage)
- Input validation on both client and server
- Webhook signature verification for payment confirmation
- Protected API routes with authentication middleware
- CORS configuration for API routes
- Environment variables for sensitive credentials

### Scalability Considerations

#### Database
- **Indexed fields**: registrationNumber, email, orderId for fast lookups
- **Foreign key relationships** ensure referential integrity
- **Decimal type** for monetary values prevents floating-point errors
- **Daily counter reset** for token numbers via scheduled job

#### Caching Strategy
- **Menu data**: 5-minute cache with stale-while-revalidate
- **Food images**: 7-day cache with cache-first
- **API responses**: TanStack Query with 5-minute stale time
- **Static assets**: Service worker cache with cache-first

#### Real-Time Scalability
- **Supabase Realtime** handles WebSocket connections at scale
- **Channel-based subscriptions** limit update scope to relevant orders
- **Automatic reconnection** on connection loss
- **Graceful degradation** if realtime unavailable (fallback to polling)

#### Payment Processing
- **Webhook-based updates** decouple payment confirmation from user session
- **Idempotent webhook handling** prevents duplicate processing
- **Retry logic** for failed push notifications
- **Order expiry** prevents inventory blocking

### Future Enhancements

#### Phase 2 Features
- **Order scheduling**: Pre-order for specific pickup time
- **Favorites**: Save frequently ordered items
- **Dietary filters**: Vegetarian, vegan, gluten-free
- **Nutrition info**: Calorie and allergen information
- **Rating system**: Student feedback on menu items
- **Loyalty program**: Points for orders, rewards for frequent users

#### Technical Improvements
- **Drag-and-drop Kanban**: Reorder orders by priority
- **Voice ordering**: Voice input for menu search
- **AR menu preview**: View food items in augmented reality
- **Analytics dashboard**: Order trends, popular items, peak times
- **Multi-language support**: English, Hindi, regional languages
- **Dark mode**: Theme toggle for low-light environments

### Requirements Coverage

This design addresses all 40 requirements from the requirements document:

- **Requirements 1-3**: Student authentication (barcode, manual, profile)
- **Requirements 4-5**: Cafeteria selection with 3D animations
- **Requirements 6-9**: Menu browsing (sections, search, combos, Priority Pass)
- **Requirements 10-11**: Shopping cart management
- **Requirements 12-13**: Order creation and payment timer
- **Requirements 14-16**: Cashfree payment integration
- **Requirements 17-18**: Real-time order tracking
- **Requirements 19-20**: Push notifications
- **Requirements 21-24**: Staff authentication and Kanban dashboard
- **Requirements 25-27**: PWA features (manifest, service worker, install prompt)
- **Requirements 28-32**: Design system (colors, typography, animations, responsive, glassmorphism)
- **Requirements 33-34**: Loading states and error handling
- **Requirements 35**: Order history
- **Requirements 36-37**: Database schema and input validation
- **Requirements 38**: State management with Zustand
- **Requirements 39**: API route protection
- **Requirements 40**: Performance optimization

### Technology Justification

#### Why Next.js 14?
- **App Router** provides server components for better performance
- **API routes** eliminate need for separate backend
- **Image optimization** automatic with next/image
- **Built-in TypeScript support**
- **Excellent PWA support** with next-pwa

#### Why Prisma?
- **Type-safe database client** prevents runtime errors
- **Schema-first approach** ensures data consistency
- **Migration system** for database versioning
- **Excellent TypeScript integration**

#### Why Supabase Realtime?
- **Managed WebSocket infrastructure** reduces operational complexity
- **PostgreSQL integration** via database triggers
- **Automatic reconnection** and error handling
- **Scalable** to thousands of concurrent connections

#### Why Cashfree?
- **India-focused** payment gateway with UPI support
- **Sandbox mode** for development and testing
- **Webhook support** for reliable payment confirmation
- **Comprehensive documentation** and SDKs

#### Why Zustand?
- **Minimal boilerplate** compared to Redux
- **Built-in persistence** with localStorage
- **TypeScript support** out of the box
- **Small bundle size** (< 1KB)

#### Why Framer Motion?
- **Declarative animations** easy to implement
- **Layout animations** for smooth transitions
- **Gesture support** for mobile interactions
- **Excellent performance** with hardware acceleration

### Deployment Considerations

#### Environment Variables
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=...
CASHFREE_APP_ID=...
CASHFREE_SECRET_KEY=...
CASHFREE_WEBHOOK_SECRET=...
NEXT_PUBLIC_CASHFREE_ENV=sandbox
NEXT_PUBLIC_APP_URL=https://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

#### Build Process
1. Install dependencies: `npm install`
2. Generate Prisma client: `npx prisma generate`
3. Run database migrations: `npx prisma migrate deploy`
4. Build Next.js app: `npm run build`
5. Start production server: `npm start`

#### Database Setup
1. Create PostgreSQL database
2. Set DATABASE_URL and DIRECT_URL
3. Run migrations: `npx prisma migrate deploy`
4. Seed initial data: `npm run db:seed`

#### Monitoring
- **Error tracking**: Sentry or similar
- **Performance monitoring**: Vercel Analytics or similar
- **Database monitoring**: Prisma Pulse or similar
- **Uptime monitoring**: Pingdom or similar

This design provides a comprehensive blueprint for implementing the Amrita Feast PWA with all required features, proper architecture, and scalability considerations.
