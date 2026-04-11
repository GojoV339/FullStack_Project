# Amrita Feast — University Canteen PWA

A mobile-first Next.js 14 PWA for university canteen ordering at Amrita University.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom CSS variables
- **Animations**: Framer Motion
- **Database**: PostgreSQL via Prisma ORM
- **State**: Zustand stores
- **Auth**: Barcode scanner (html5-qrcode) + manual entry
- **Runtime**: Node.js 20 (via Nix)

## Design System — Warm Food Theme

All pages use a warm light palette:
- **Background**: `#FFF8F4` (warm off-white)
- **Surface**: `#FFFFFF` (white cards)
- **Primary**: `#FF6B35` (orange)
- **Warm accent**: `#FFB347` (amber/gold)
- **Surface dim**: `#FFF0E8` (soft peach)
- **Dark text**: `#1A1A2E`

**Exception**: Login page uses a dark scanner background with warm orange radial gradient: `radial-gradient(ellipse at top, #FF6B35, #C0410F, #1A1A2E)`

## Key Features

1. **Barcode Login** — Scan Amrita ID card barcode to authenticate
2. **Cafeteria Selector** — Pick from available canteens with wait-time badges
3. **Menu** — Tabbed (Snacks / Cook-to-Order) with combos section, search, and food cards
4. **Cart Sheet** — Bottom sheet with animated item controls
5. **Checkout** — Order creation with countdown payment timer
6. **UPI Payment Simulation** — `/payment` page with:
   - 6 UPI app buttons (GPay, PhonePe, Paytm, BHIM, Amazon Pay, Other)
   - UPI ID manual entry
   - QR code scanner toggle
   - Processing animation (pulsing rings + progress bar)
   - Success overlay with receipt and UPI reference
7. **Order Tracker** — Real-time status stepper (Confirmed → Preparing → Ready → Collected)
8. **Staff Dashboard** — Kanban-style order management for kitchen staff

## Architecture

```
app/
├── (app)/          # Student-facing pages (guarded)
│   ├── cafeteria/  # Canteen selector
│   ├── menu/       # Food menu
│   ├── checkout/   # Order summary + timer
│   ├── payment/    # UPI payment simulation ✨
│   ├── success/    # Order confirmation + token
│   ├── tracker/[orderId]/  # Live order tracker
│   ├── orders/     # Order history
│   └── profile/    # User profile
├── (auth)/
│   └── login/      # Barcode scanner login
├── staff/
│   └── dashboard/  # Kitchen Kanban board
└── api/            # REST API routes

src/
├── components/     # Reusable UI components
├── store/          # Zustand state stores
├── hooks/          # Custom React hooks
├── lib/            # API client, Prisma, utils
└── types/          # TypeScript types
```

## Wait Time Badge Colors

- `< 10 min` → Green (`#ECFDF5` / `#065F46`)
- `10–20 min` → Amber (`#FEF3C7` / `#92400E`)
- `> 20 min` → Red (`#FEF2F2` / `#991B1B`)

## Section Badges

- **Snacks (Ready)**: Blue (`.section-badge-snack`)
- **Cook to Order**: Red-orange (`.section-badge-cook`)
- **Combos**: Purple (`.section-badge-combo`)

## Workflow

```
PORT=5000 /nix/store/.../nodejs-20.../bin/npm run dev
```
- Runs Next.js on port 5000
- Wait for port: 5000
- Output type: webview

## APIs

- `POST /api/auth/barcode-login` — Scan ID card login
- `POST /api/auth/manual-login` — Manual registration number login
- `GET /api/cafeterias` — List canteens
- `GET /api/menu/:cafeteriaId` — Fetch menu
- `POST /api/orders` — Create order
- `PATCH /api/orders/:id/status` — Update order status (staff)
- `POST /api/payments/simulate` — Simulate UPI payment ✨
- `POST /api/payments/cashfree-webhook` — Cashfree payment webhook
