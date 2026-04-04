# 🍽️ Amrita Feast — PWA Canteen App

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?style=for-the-badge&logo=supabase)

Amrita Feast is a premium, mobile-first **Progressive Web App (PWA)** built to eliminate queues at the university canteens. Students can log in instantly via college ID barcode scanning, browse cafeteria-specific menus, make UPI payments, and track their food preparation in real-time. Kitchen staff receive orders directly into a live dashboard capable of updating statuses instantly.

---

## ✨ Features

### For Students:
- **📱 PWA Installation:** Works exactly like a native app (Add to Homescreen).
- **📷 Barcode Login:** Hardware-accelerated barcode scanner to read Amrita ID cards and extract Registration numbers locally.
- **🏪 Multi-Cafeteria Support:** Browse multiple operational canteens, view live wait times and open/close status.
- **🛒 Dynamic Cart & Timer:** Zustand-powered cart that resets automatically when switching cafeterias. A 5-minute expiry countdown triggers once an order is initialized.
- **💳 Cashfree UPI Payments:** Integrated webhook signatures and seamless UPI intent redirects right from the app.
- **🔔 Live Tracking & Push:** Animated vertical stepper for live order status (`CONFIRMED` → `PREPARING` → `READY` → `COLLECTED`) + Web Push Notifications.

### For App/Kitchen Staff:
- **👨‍🍳 Secure Staff Login:** Simple email/password bcrypt-authenticated gateway for kitchen staff.
- **📊 Realtime Kitchen Dashboard:** Kanban-style order management dashboard splitting orders intelligently by their current phase. 
- **⚡ 1-Click Operations:** Advance an order from "Confirm" to "Ready" and instantly notify the student's device.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Languages:** TypeScript
- **Styling:** Tailwind CSS + custom Glassmorphism tokens
- **Animations:** Framer Motion
- **Database:** PostgreSQL on [Supabase](https://supabase.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **State Management:** Zustand
- **Payments:** Cashfree Payments SDK
- **PWA Configuration:** `next-pwa`

---

## 🚀 Getting Started (Local Development)

### 1. Database Setup
1. Create a free PostgreSQL database on [Supabase.com](https://supabase.com/).
2. Get the **Transaction Pooler URL** (port 6543) and the **Direct Connection URL** (port 5432).
3. Put those inside your project's `.env.local` and `.env` files.

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Database (Prisma)
Push the tables to Supabase and seed the DB with demo canteens, menus, and the admin user:
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run the App
```bash
npm run dev
```
Access the application at: **`http://localhost:3000`**

---

## 🔑 Demo Access

**Student:**
- When prompted to scan, you can click "Enter manually" at the bottom.
- Enter any valid Amrita ID format, e.g., `BL.EN.U4CSE22001`.

**Staff:**
- Navigate to `http://localhost:3000/staff/login`
- **Email:** `admin@amrita.edu`
- **Password:** `admin123`

---

## 📂 Project Structure

```text
├── app/                  # Next.js App Router root
│   ├── (app)/            # Authenticated application views (menu, orders, tracker)
│   ├── (auth)/           # Barcode & manual login pages
│   ├── api/              # Secure backend endpoints (Auth, Orders, Webhook)
│   ├── staff/            # Kitchen Kanban dashboard & authentication
│   └── globals.css       # Core design tokens
├── prisma/               # Database definitions & seeder
├── public/               # Static assets & PWA manifest
└── src/
    ├── components/       # Reusable layout and UI components
    ├── hooks/            # Custom hooks (PWA, Realtime updates, Timers)
    ├── lib/              # Utilities (JWT logic, Push, Cashfree signature verification)
    ├── store/            # Zustand global state (Cart, Order, Config)
    └── types/            # Global TypeScript definitions
```

---

## 🛡️ Environment Variables
Refer to `.env` or `.env.local` for the exact requirements. Required external keys include:
- `DATABASE_URL` (Supabase pooler)
- `DIRECT_URL` (Supabase direct conn)
- `JWT_SECRET` (For stateless token verification)
- *Optional:* `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`. If excluded, the app defaults to simulated payments and disables push alerts dynamically.

---
> *Developed for solving queue times at Amrita Vishwa Vidyapeetham campuses.*
