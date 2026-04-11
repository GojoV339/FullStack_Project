# Requirements Document

## Introduction

Amrita Feast is a premium Progressive Web App (PWA) designed for Amrita Vishwa Vidyapeetham, Bengaluru campus to eliminate cafeteria queues through a pre-ordering system. Students scan their college ID barcode to authenticate, browse cafeteria-specific menus with real-time availability, place orders with UPI payment integration, and track their order status in real-time. Kitchen staff receive orders through a live dashboard with Kanban-style status management. The system provides a premium food delivery app experience with warm food colors, smooth animations, and mobile-first responsive design.

## Glossary

- **Student**: A registered user of the system who can browse menus, place orders, and track order status
- **Staff**: Kitchen personnel who manage incoming orders and update order preparation status
- **Cafeteria**: A physical food service location on campus (Samridhi, Canteen Main, E Block Canteen)
- **Menu_Item**: A food or beverage product available for purchase with pricing, preparation time, and availability status
- **Order**: A collection of menu items requested by a student with payment and status tracking
- **Token_Number**: A sequential daily counter assigned to each confirmed order for pickup identification
- **Order_Number**: A unique identifier in format "AF-YYYY-####" assigned to each order
- **Cart**: A temporary collection of menu items selected by a student before order placement
- **Payment_System**: The Cashfree Payments integration handling UPI transactions
- **Order_Status**: The current state of an order (AWAITING_PAYMENT, CONFIRMED, PREPARING, READY, COLLECTED)
- **Priority_Pass**: A subscription feature granting access to exclusive menu items
- **PWA**: Progressive Web App - a web application that can be installed and used like a native mobile app
- **Registration_Number**: A unique student identifier following the pattern /^[A-Z]{2}\.EN\.U4[A-Z]{3}\d{2}\d{3}$/
- **JWT**: JSON Web Token used for stateless authentication with 7-day expiry
- **Supabase_Realtime**: Real-time database subscription service for live order updates
- **Service_Worker**: Background script enabling offline functionality and push notifications
- **UPI**: Unified Payments Interface - India's instant payment system
- **Barcode_Scanner**: HTML5-based camera interface for reading college ID barcodes
- **Kanban_Board**: Visual workflow management interface with columns for order status stages


## Requirements

### Requirement 1: Student Authentication via Barcode Scanning

**User Story:** As a student, I want to log in by scanning my college ID barcode with my phone camera, so that I can quickly access the ordering system without typing credentials.

#### Acceptance Criteria

1. WHEN the login page loads, THE Barcode_Scanner SHALL activate the device rear camera
2. WHEN a barcode is detected, THE Barcode_Scanner SHALL decode the barcode content within 500ms
3. WHEN the decoded barcode contains a valid Registration_Number, THE Authentication_System SHALL create a JWT token with 7-day expiry
4. WHEN the decoded barcode does not match the Registration_Number pattern, THE Authentication_System SHALL return an error message "Invalid registration number format"
5. WHEN camera access is denied, THE Login_Page SHALL display a manual login fallback option
6. THE JWT_Token SHALL be stored in an httpOnly cookie with secure flag enabled
7. WHEN authentication succeeds, THE System SHALL redirect the Student to the cafeteria selection page

### Requirement 2: Manual Login Fallback

**User Story:** As a student, I want to manually enter my registration number if barcode scanning fails, so that I can still access the system.

#### Acceptance Criteria

1. THE Login_Page SHALL display a "Can't scan? Enter manually" button at the bottom of the screen
2. WHEN the manual login button is clicked, THE System SHALL display a bottom sheet with a registration number input field
3. THE Input_Field SHALL automatically convert entered text to uppercase
4. WHEN a Registration_Number is submitted, THE Validation_System SHALL verify it matches the pattern /^[A-Z]{2}\.EN\.U4[A-Z]{3}\d{2}\d{3}$/
5. WHEN the Registration_Number is valid, THE Authentication_System SHALL create a JWT token and authenticate the Student
6. WHEN the Registration_Number is invalid, THE System SHALL display an error message "Invalid registration number format"

### Requirement 3: Student Profile Management

**User Story:** As a student, I want my profile to track my subscription status, so that I can access Priority Pass exclusive items.

#### Acceptance Criteria

1. WHEN a Student authenticates for the first time, THE System SHALL create a Student profile with INACTIVE subscription status
2. THE Student_Profile SHALL store registrationNumber, name, phone, subscriptionStatus, and subscriptionExpiry
3. WHEN a Student has an ACTIVE subscription with subscriptionExpiry in the future, THE System SHALL grant access to Priority Pass menu items
4. WHEN a Student has an INACTIVE subscription or expired subscriptionExpiry, THE System SHALL blur Priority Pass menu items
5. THE System SHALL persist Student authentication state using Zustand with localStorage persistence

### Requirement 4: Cafeteria Selection Interface

**User Story:** As a student, I want to see all available cafeterias with their current status and wait times, so that I can choose where to order from.

#### Acceptance Criteria

1. THE Cafeteria_Page SHALL display all three cafeterias: Samridhi (Main Block), Canteen Main (Admin Block), and E Block Canteen
2. WHEN the Cafeteria_Page loads, THE System SHALL fetch real-time cafeteria data including isOpen status and avgWaitMinutes
3. THE Cafeteria_Card SHALL display the cafeteria name, location, open/closed status, and average wait time
4. WHEN a Cafeteria is closed, THE Cafeteria_Card SHALL display with 50% opacity and be non-clickable
5. WHEN a Cafeteria is open, THE Cafeteria_Card SHALL be clickable and display a "Open Now" badge
6. WHEN a Student hovers over a Cafeteria_Card, THE Card SHALL apply a 3D tilt effect based on mouse position
7. WHEN a Student clicks an open Cafeteria, THE System SHALL store the cafeteriaId and cafeteriaName in the Cart state and navigate to the menu page

### Requirement 5: 3D Cafeteria Card Animations

**User Story:** As a student, I want visually engaging cafeteria selection cards, so that the app feels premium and modern.

#### Acceptance Criteria

1. THE Cafeteria_Card SHALL use React Three Fiber for 3D rendering effects
2. WHEN a Student moves their mouse over a Cafeteria_Card, THE Card SHALL rotate on X and Y axes with perspective transform
3. THE Card_Rotation SHALL be limited to maximum 8 degrees in any direction
4. WHEN the mouse leaves the Cafeteria_Card, THE Card SHALL smoothly return to neutral position within 100ms
5. THE Cafeteria_Card SHALL display a gradient glow effect unique to each cafeteria
6. WHEN a Cafeteria_Card is hovered, THE System SHALL display a shimmer animation overlay

### Requirement 6: Menu Browsing with Sections

**User Story:** As a student, I want to browse menu items organized by preparation time, so that I can choose between ready-made snacks and freshly cooked items.

#### Acceptance Criteria

1. THE Menu_Page SHALL display two tabs: "Ready Now" (SNACK section) and "Cook to Order" (COOK_TO_ORDER section)
2. WHEN the Menu_Page loads, THE System SHALL fetch menu items for the selected Cafeteria
3. THE SNACK_Section SHALL display items with 0 minutes ETA
4. THE COOK_TO_ORDER_Section SHALL display items with preparation time greater than 0 minutes
5. THE Menu_Item_Card SHALL display name, price, category, image, and ETA minutes
6. WHEN a Student switches tabs, THE System SHALL animate the transition using Framer Motion layout animations
7. THE Menu_Page SHALL display items in a 2-column grid on mobile devices

### Requirement 7: Menu Search Functionality

**User Story:** As a student, I want to search for specific menu items, so that I can quickly find what I want to order.

#### Acceptance Criteria

1. THE Menu_Page SHALL display a search input field in the sticky header
2. WHEN a Student types in the search field, THE System SHALL filter menu items by name in real-time
3. THE Search_Filter SHALL be case-insensitive
4. WHEN search results are empty, THE System SHALL display "No items match your search" message
5. WHEN the search field is cleared, THE System SHALL display all menu items for the active tab

### Requirement 8: Combo Deals Display

**User Story:** As a student, I want to see combo deals with savings badges, so that I can get better value for my money.

#### Acceptance Criteria

1. WHEN the Menu_Page loads and combo items exist, THE System SHALL display a horizontal scrollable "COMBOS" section above the main menu grid
2. THE Combo_Card SHALL display a "🎁 COMBOS" badge with "Save more!" text
3. THE Combo_Item SHALL have isCombo flag set to true in the database
4. THE Combo_Section SHALL appear only when search query is empty
5. THE Combo_Card SHALL be 200px wide in the horizontal scroll container

### Requirement 9: Priority Pass Exclusive Items

**User Story:** As a student, I want to see Priority Pass exclusive items, so that I know what benefits I get with a subscription.

#### Acceptance Criteria

1. WHEN the Menu_Page loads and Priority Pass items exist, THE System SHALL display a "⭐ PRIORITY PASS" section below the main menu
2. WHEN a Student has INACTIVE subscription status, THE Priority_Pass_Item SHALL display with a blur filter effect
3. WHEN a Student has ACTIVE subscription status, THE Priority_Pass_Item SHALL display normally without blur
4. THE Priority_Pass_Item SHALL have isPriorityOnly flag set to true in the database
5. THE Priority_Pass_Section SHALL display a gold gradient badge with "⭐ PRIORITY PASS" text
6. THE Priority_Pass_Section SHALL appear only when search query is empty

### Requirement 10: Shopping Cart Management

**User Story:** As a student, I want to add items to my cart with visual feedback, so that I know my selections are registered.

#### Acceptance Criteria

1. WHEN a Student clicks "Add to Cart" on a Menu_Item, THE System SHALL add the item to the Cart with quantity 1
2. WHEN an item already exists in the Cart, THE System SHALL increment its quantity by 1
3. WHEN an item is added to the Cart, THE System SHALL trigger haptic feedback vibration for 50ms
4. WHEN an item is added to the Cart, THE System SHALL display a flying food emoji animation from the item to the cart button
5. THE Cart_State SHALL be managed using Zustand with localStorage persistence
6. THE Cart SHALL store cafeteriaId, cafeteriaName, and an array of CartItems
7. WHEN a Student switches to a different Cafeteria with items in the Cart, THE System SHALL clear the Cart automatically

### Requirement 11: Cart Display and Interaction

**User Story:** As a student, I want to view and modify my cart contents, so that I can review my order before checkout.

#### Acceptance Criteria

1. THE Menu_Page SHALL display a floating Cart_Button showing the total item count
2. WHEN the Cart has items, THE Cart_Button SHALL display the item count badge with animation
3. WHEN the Cart_Button is clicked, THE System SHALL open a bottom sheet (mobile) or sidebar (desktop) displaying cart contents
4. THE Cart_Sheet SHALL display each item with name, quantity, unit price, and subtotal
5. THE Cart_Sheet SHALL provide increment/decrement buttons for quantity adjustment
6. WHEN quantity is decremented to 0, THE System SHALL remove the item from the Cart
7. THE Cart_Sheet SHALL display the total amount at the bottom
8. THE Cart_Sheet SHALL provide a "Proceed to Checkout" button

### Requirement 12: Order Creation and Number Generation

**User Story:** As a student, I want my order to receive a unique order number, so that I can reference it for tracking and support.

#### Acceptance Criteria

1. WHEN a Student proceeds to checkout, THE System SHALL generate an Order_Number in format "AF-YYYY-####"
2. THE Order_Number SHALL use the current year for YYYY
3. THE Order_Number SHALL use a daily sequential counter for ####, starting at 0001 each day
4. THE System SHALL generate a Token_Number using a daily sequential counter starting at 1 each day
5. THE Order SHALL store studentId, cafeteriaId, items, totalAmount, and expiresAt timestamp
6. THE Order SHALL be created with orderStatus AWAITING_PAYMENT and paymentStatus PENDING
7. THE expiresAt timestamp SHALL be set to 5 minutes from order creation time

### Requirement 13: Payment Timer and Auto-Expiry

**User Story:** As a student, I want a clear countdown timer for payment completion, so that I know how much time I have before my order expires.

#### Acceptance Criteria

1. WHEN an Order is created, THE System SHALL display a 5-minute countdown timer on the payment page
2. THE Countdown_Timer SHALL update every second with visual progress indication
3. WHEN the timer reaches 0, THE System SHALL automatically expire the Order
4. WHEN an Order expires, THE System SHALL update orderStatus to CANCELLED and paymentStatus to EXPIRED
5. WHEN an Order expires, THE System SHALL display a message "Order expired. Please try again."
6. THE Timer SHALL use the useCountdown custom hook for countdown logic

### Requirement 14: Cashfree UPI Payment Integration

**User Story:** As a student, I want to pay for my order using UPI, so that I can complete the transaction securely and conveniently.

#### Acceptance Criteria

1. WHEN a Student proceeds to payment, THE Payment_System SHALL create a Cashfree order with the Order total amount
2. THE Payment_System SHALL generate a cashfreeOrderId and store it in the Payment record
3. THE Payment_Page SHALL display a UPI app grid with icons for GPay, PhonePe, Paytm, BHIM, and other UPI apps
4. THE Payment_Page SHALL provide a UPI ID input field for manual UPI ID entry
5. THE Payment_Page SHALL display a QR code for UPI payment scanning
6. WHEN a Student selects a UPI app, THE System SHALL initiate UPI intent with the selected app
7. THE Payment_System SHALL operate in sandbox mode for testing

### Requirement 15: Payment Processing Simulation

**User Story:** As a student, I want visual feedback during payment processing, so that I know the system is working on my transaction.

#### Acceptance Criteria

1. WHEN a Student initiates payment, THE Payment_Page SHALL display a processing animation
2. THE Processing_Animation SHALL run for 2.5 seconds minimum
3. WHEN payment processing completes successfully, THE System SHALL display a success overlay with payment confirmation
4. THE Success_Overlay SHALL display the Order_Number and Token_Number
5. WHEN payment processing fails, THE System SHALL display an error message and allow retry
6. THE Payment_System SHALL use Lottie animations for processing and success states

### Requirement 16: Payment Webhook Handling

**User Story:** As the system, I want to receive payment confirmation from Cashfree, so that I can update order status automatically.

#### Acceptance Criteria

1. WHEN Cashfree sends a payment webhook, THE Webhook_Handler SHALL verify the signature using the Cashfree secret key
2. WHEN the webhook signature is invalid, THE Webhook_Handler SHALL return a 401 Unauthorized response
3. WHEN the webhook signature is valid and payment status is SUCCESS, THE System SHALL update paymentStatus to PAID
4. WHEN paymentStatus is updated to PAID, THE System SHALL update orderStatus to CONFIRMED
5. WHEN orderStatus is updated to CONFIRMED, THE System SHALL assign a Token_Number to the Order
6. THE Webhook_Handler SHALL return a 200 OK response after successful processing

### Requirement 17: Order Status Tracking Interface

**User Story:** As a student, I want to track my order status in real-time, so that I know when to collect my food.

#### Acceptance Criteria

1. WHEN payment is confirmed, THE System SHALL redirect the Student to the order tracker page
2. THE Order_Tracker_Page SHALL display the Order_Number and Token_Number prominently
3. THE Order_Tracker_Page SHALL display a vertical stepper with status stages: CONFIRMED, PREPARING, READY, COLLECTED
4. THE Status_Stepper SHALL highlight the current order status with animation
5. THE Token_Number SHALL display with a glow effect when the order status is READY
6. THE Order_Tracker_Page SHALL use Lottie animations for each status stage (chef hat, cooking, bell)

### Requirement 18: Real-Time Order Updates

**User Story:** As a student, I want my order status to update automatically without refreshing, so that I get instant notifications when my food is ready.

#### Acceptance Criteria

1. WHEN the Order_Tracker_Page loads, THE System SHALL subscribe to Supabase Realtime updates for the Order
2. WHEN the Order status changes in the database, THE System SHALL receive the update within 1 second
3. WHEN a status update is received, THE Status_Stepper SHALL animate the transition to the new status
4. THE Realtime_Subscription SHALL use the useRealtimeOrder custom hook
5. WHEN the Order_Tracker_Page unmounts, THE System SHALL unsubscribe from Realtime updates

### Requirement 19: Push Notification Subscription

**User Story:** As a student, I want to receive push notifications for order updates, so that I'm notified even when the app is in the background.

#### Acceptance Criteria

1. WHEN a Student first accesses the app, THE System SHALL request push notification permission
2. WHEN push notification permission is granted, THE System SHALL create a push subscription using the VAPID public key
3. THE Push_Subscription SHALL be stored in the PushSubscription table with the studentId
4. WHEN an Order status changes, THE System SHALL send a push notification to the Student's subscribed devices
5. THE Push_Notification SHALL include the Order_Number and new status in the message
6. THE Push_System SHALL use the web-push library for notification delivery

### Requirement 20: Push Notification Delivery

**User Story:** As a student, I want to receive timely push notifications when my order status changes, so that I don't miss when my food is ready.

#### Acceptance Criteria

1. WHEN orderStatus changes to CONFIRMED, THE Push_System SHALL send a notification "Order confirmed! Token #[number]"
2. WHEN orderStatus changes to PREPARING, THE Push_System SHALL send a notification "Your food is being prepared"
3. WHEN orderStatus changes to READY, THE Push_System SHALL send a notification "Order ready for pickup! Token #[number]"
4. THE Push_Notification SHALL include the app icon and use the warm color scheme
5. WHEN a push notification is clicked, THE System SHALL open the Order_Tracker_Page for that Order
6. IF push notification delivery fails, THE System SHALL log the error but not block order processing

### Requirement 21: Staff Authentication

**User Story:** As a staff member, I want to log in with my email and password, so that I can access the kitchen dashboard securely.

#### Acceptance Criteria

1. THE Staff_Login_Page SHALL display email and password input fields
2. WHEN staff credentials are submitted, THE Authentication_System SHALL verify the email and password against the Staff table
3. THE Staff_Password SHALL be hashed using bcrypt with salt rounds of 10
4. WHEN credentials are valid, THE System SHALL create a JWT token with staff role and 7-day expiry
5. WHEN credentials are invalid, THE System SHALL return an error message "Invalid email or password"
6. WHEN authentication succeeds, THE System SHALL redirect the Staff to the kitchen dashboard

### Requirement 22: Kitchen Dashboard Kanban Board

**User Story:** As a staff member, I want to see all orders organized by status, so that I can manage the kitchen workflow efficiently.

#### Acceptance Criteria

1. THE Kitchen_Dashboard SHALL display a 3-column Kanban board with columns: CONFIRMED, PREPARING, READY
2. WHEN the Kitchen_Dashboard loads, THE System SHALL fetch all orders with orderStatus in [CONFIRMED, PREPARING, READY]
3. THE Order_Card SHALL display Order_Number, Token_Number, items list, total amount, and time since order creation
4. THE Kanban_Board SHALL group orders by orderStatus in their respective columns
5. THE Kitchen_Dashboard SHALL subscribe to Supabase Realtime updates for new orders
6. WHEN a new order is received, THE System SHALL play a sound notification

### Requirement 23: Staff Order Status Management

**User Story:** As a staff member, I want to update order status with one click, so that I can quickly move orders through the preparation workflow.

#### Acceptance Criteria

1. THE Order_Card SHALL display status action buttons based on current orderStatus
2. WHEN orderStatus is CONFIRMED, THE Order_Card SHALL display a "Start Preparing" button
3. WHEN the "Start Preparing" button is clicked, THE System SHALL update orderStatus to PREPARING
4. WHEN orderStatus is PREPARING, THE Order_Card SHALL display a "Mark Ready" button
5. WHEN the "Mark Ready" button is clicked, THE System SHALL update orderStatus to READY
6. WHEN orderStatus is READY, THE Order_Card SHALL display a "Mark Collected" button
7. WHEN the "Mark Collected" button is clicked, THE System SHALL update orderStatus to COLLECTED
8. WHEN orderStatus is updated, THE System SHALL send a push notification to the Student

### Requirement 24: Real-Time Kitchen Dashboard Updates

**User Story:** As a staff member, I want the dashboard to update automatically when orders are placed or status changes, so that I always see the current state.

#### Acceptance Criteria

1. WHEN the Kitchen_Dashboard loads, THE System SHALL subscribe to Supabase Realtime updates on the Order table
2. WHEN a new Order is created with orderStatus CONFIRMED, THE System SHALL add it to the CONFIRMED column within 1 second
3. WHEN an Order status is updated by any staff member, THE System SHALL move the Order_Card to the appropriate column within 1 second
4. WHEN an Order reaches COLLECTED status, THE System SHALL remove it from the Kanban board
5. THE Realtime_Subscription SHALL persist for the entire dashboard session

### Requirement 25: PWA Manifest and Installation

**User Story:** As a student, I want to install the app on my phone home screen, so that I can access it like a native app.

#### Acceptance Criteria

1. THE System SHALL provide a manifest.json file with app name, icons, theme colors, and display mode
2. THE Manifest SHALL define app name as "Amrita Feast"
3. THE Manifest SHALL include icons in sizes 72x72, 96x96, 128x128, 192x192, and 512x512 pixels
4. THE Manifest SHALL set display mode to "standalone"
5. THE Manifest SHALL set theme_color to "#FF6B35" (saffron-orange)
6. THE Manifest SHALL set background_color to "#FFF8F4" (warm off-white)
7. THE Manifest SHALL define shortcuts for quick access to cafeteria selection and order tracking

### Requirement 26: PWA Service Worker and Offline Support

**User Story:** As a student, I want the app to work offline for basic functionality, so that I can browse menus even with poor connectivity.

#### Acceptance Criteria

1. THE System SHALL register a service worker using next-pwa and Workbox
2. THE Service_Worker SHALL cache static assets (HTML, CSS, JS, images) on first load
3. THE Service_Worker SHALL cache API responses for cafeteria and menu data with stale-while-revalidate strategy
4. WHEN the device is offline, THE System SHALL serve cached menu data if available
5. WHEN the device is offline and no cache exists, THE System SHALL display an offline message
6. THE Service_Worker SHALL handle push notification events when the app is closed

### Requirement 27: PWA Install Prompt

**User Story:** As a student, I want to see an install prompt, so that I know I can add the app to my home screen.

#### Acceptance Criteria

1. WHEN the app is accessed on a mobile browser and not yet installed, THE System SHALL display an install banner
2. THE Install_Banner SHALL appear after the Student has used the app for at least 30 seconds
3. THE Install_Banner SHALL display the app icon, name, and an "Install" button
4. WHEN the "Install" button is clicked, THE System SHALL trigger the browser's native install prompt
5. WHEN the install prompt is dismissed, THE System SHALL not show the banner again for 7 days
6. THE Install_Prompt SHALL use the usePWAInstall custom hook for state management

### Requirement 28: Design System Color Palette

**User Story:** As a user, I want the app to use warm food colors throughout, so that it feels inviting and appetizing.

#### Acceptance Criteria

1. THE Design_System SHALL use #FF6B35 (saffron-orange) as the primary color
2. THE Design_System SHALL use #FFB347 (turmeric yellow) as the accent color
3. THE Design_System SHALL use #FFF8F4 (warm off-white) as the background color
4. THE Design_System SHALL use #FFFFFF for card surfaces
5. THE Design_System SHALL NOT use gray colors anywhere in the interface
6. THE Design_System SHALL define success color as green, error color as red, and warning color as amber
7. THE Tailwind_Config SHALL define these colors as custom tokens

### Requirement 29: Typography and Font System

**User Story:** As a user, I want consistent, readable typography throughout the app, so that content is easy to read.

#### Acceptance Criteria

1. THE Design_System SHALL use Inter font family from Google Fonts
2. THE Font SHALL be loaded using next/font for optimal performance
3. THE Design_System SHALL define font sizes: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px)
4. THE Design_System SHALL use font weights: normal (400), medium (500), semibold (600), bold (700)
5. THE Body_Text SHALL use base size with normal weight
6. THE Headings SHALL use bold weight with appropriate size scale

### Requirement 30: Animation System

**User Story:** As a user, I want smooth animations for every interaction, so that the app feels premium and responsive.

#### Acceptance Criteria

1. THE System SHALL use Framer Motion for all animations
2. WHEN a page loads, THE System SHALL animate page entrance with fade-in and slide-up effect
3. WHEN a button is tapped, THE System SHALL apply a scale-down animation to 0.95
4. WHEN a card is hovered, THE System SHALL apply a subtle lift effect with shadow increase
5. WHEN items are added to cart, THE System SHALL animate a flying emoji from item to cart button
6. WHEN tabs are switched, THE System SHALL use layout animations for smooth transitions
7. THE Animation_Duration SHALL be between 150ms and 300ms for micro-interactions

### Requirement 31: Responsive Layout System

**User Story:** As a user, I want the app to work perfectly on any device size, so that I can use it on phone, tablet, or desktop.

#### Acceptance Criteria

1. THE Design_System SHALL follow mobile-first responsive design principles
2. WHEN the viewport width is less than 768px, THE System SHALL display bottom navigation
3. WHEN the viewport width is 768px or greater, THE System SHALL display sidebar navigation
4. THE Menu_Grid SHALL display 2 columns on mobile and 3-4 columns on desktop
5. THE Cart SHALL display as a bottom sheet on mobile and a sidebar on desktop
6. THE System SHALL use Tailwind CSS responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
7. THE System SHALL apply safe-area-inset padding for notched devices

### Requirement 32: Glassmorphism UI Components

**User Story:** As a user, I want modern glassmorphism effects on UI components, so that the interface feels contemporary and premium.

#### Acceptance Criteria

1. THE Design_System SHALL define a glass-card class with backdrop-blur and semi-transparent background
2. THE Glass_Card SHALL use backdrop-filter: blur(12px) and background with 10% opacity
3. THE Glass_Card SHALL have a subtle border with 20% white opacity
4. THE Navigation_Bar SHALL use glassmorphism effect when sticky or fixed
5. THE Bottom_Sheet SHALL use glassmorphism effect for the overlay background
6. THE Modal_Overlay SHALL use glassmorphism effect with darker tint

### Requirement 33: Loading States and Skeletons

**User Story:** As a user, I want to see loading placeholders while content loads, so that I know the app is working.

#### Acceptance Criteria

1. WHEN data is being fetched, THE System SHALL display skeleton loading placeholders
2. THE Skeleton SHALL match the shape and size of the content it represents
3. THE Skeleton SHALL animate with a shimmer effect from left to right
4. THE Skeleton_Animation SHALL loop continuously until content loads
5. THE Menu_Grid SHALL display 6 skeleton cards while loading
6. THE Cafeteria_List SHALL display 3 skeleton cards while loading

### Requirement 34: Error Handling and Toast Notifications

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. THE System SHALL use the Sonner library for toast notifications
2. WHEN an API request fails, THE System SHALL display an error toast with a descriptive message
3. WHEN an action succeeds, THE System SHALL display a success toast with confirmation
4. THE Toast SHALL auto-dismiss after 4 seconds
5. THE Toast SHALL be dismissible by swiping on mobile
6. THE Toast SHALL use the warm color palette (success: green, error: red, info: orange)
7. THE Error_Message SHALL be user-friendly and avoid technical jargon

### Requirement 35: Order History View

**User Story:** As a student, I want to view my past orders, so that I can reorder my favorite items or track my spending.

#### Acceptance Criteria

1. THE Orders_Page SHALL display a list of all orders placed by the Student
2. THE Order_List SHALL be sorted by creation date in descending order (newest first)
3. THE Order_Card SHALL display Order_Number, Cafeteria name, total amount, order date, and final status
4. WHEN an Order_Card is clicked, THE System SHALL navigate to the Order_Tracker_Page for that Order
5. WHEN no orders exist, THE System SHALL display an empty state message "No orders yet"
6. THE Orders_Page SHALL use infinite scroll pagination for orders beyond the first 20

### Requirement 36: Database Schema Validation

**User Story:** As the system, I want to validate all data against the schema, so that data integrity is maintained.

#### Acceptance Criteria

1. THE System SHALL use Prisma ORM for database operations
2. THE Prisma_Schema SHALL define all models with appropriate field types and constraints
3. THE Student_Model SHALL enforce unique constraint on registrationNumber
4. THE Order_Model SHALL enforce foreign key relationships to Student and Cafeteria
5. THE Payment_Model SHALL enforce unique constraint on orderId
6. THE Staff_Model SHALL enforce unique constraint on email
7. THE System SHALL use Zod for runtime input validation on API routes

### Requirement 37: Input Validation with Zod

**User Story:** As the system, I want to validate all user inputs, so that invalid data is rejected before processing.

#### Acceptance Criteria

1. THE System SHALL define Zod schemas for all API request bodies
2. THE Registration_Number_Schema SHALL validate the pattern /^[A-Z]{2}\.EN\.U4[A-Z]{3}\d{2}\d{3}$/
3. THE Order_Creation_Schema SHALL validate that items array is not empty and all quantities are positive integers
4. THE Payment_Webhook_Schema SHALL validate required Cashfree webhook fields
5. WHEN validation fails, THE System SHALL return a 400 Bad Request response with validation error details
6. THE Validation_Error SHALL include the field name and reason for failure

### Requirement 38: State Management with Zustand

**User Story:** As the system, I want centralized state management, so that data flows consistently across components.

#### Acceptance Criteria

1. THE System SHALL use Zustand for global state management
2. THE Auth_Store SHALL manage Student authentication state and persist to localStorage
3. THE Cart_Store SHALL manage shopping cart state and persist to localStorage
4. THE Order_Store SHALL manage current order state without persistence
5. WHEN the browser is refreshed, THE System SHALL restore Auth_Store and Cart_Store from localStorage
6. THE Store_Actions SHALL be defined as methods within the store for type safety

### Requirement 39: API Route Protection

**User Story:** As the system, I want to protect API routes from unauthorized access, so that only authenticated users can access protected resources.

#### Acceptance Criteria

1. THE System SHALL verify JWT tokens on all protected API routes
2. WHEN a request lacks a valid JWT token, THE System SHALL return a 401 Unauthorized response
3. WHEN a JWT token is expired, THE System SHALL return a 401 Unauthorized response with message "Token expired"
4. THE JWT_Verification SHALL extract the studentId or staffId from the token payload
5. THE Protected_Route SHALL only allow access to resources owned by the authenticated user
6. THE Staff_Routes SHALL only be accessible with staff role JWT tokens

### Requirement 40: Performance Optimization

**User Story:** As a user, I want the app to load quickly and respond instantly, so that I have a smooth experience.

#### Acceptance Criteria

1. THE System SHALL achieve a Lighthouse performance score of 90 or higher
2. THE System SHALL use Next.js Image component for optimized image loading
3. THE System SHALL implement code splitting for route-based lazy loading
4. THE System SHALL use TanStack Query for API request caching and deduplication
5. THE Menu_Images SHALL be lazy loaded as they enter the viewport
6. THE System SHALL prefetch critical routes on hover for instant navigation
7. THE Bundle_Size SHALL be under 200KB for the initial JavaScript payload
