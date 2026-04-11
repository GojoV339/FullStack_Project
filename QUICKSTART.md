# 🚀 Amrita Feast PWA - Quick Start Guide

This guide will help you get the Amrita Feast PWA up and running in minutes.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** 18.x or higher installed
- **npm** or **yarn** package manager
- A **Supabase** account (free tier works)
- A **Cashfree** merchant account (sandbox mode for testing)

## Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Prisma, Supabase, and more.

### 2️⃣ Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Now edit `.env.local` and fill in the required values:

#### A. Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Navigate to **Settings** → **Database**
4. Copy the connection strings:

```env
# Connection Pooling URL (port 6543)
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection URL (port 5432)
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres"
```

5. Go to **Settings** → **API** and copy:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### B. Payment Gateway (Cashfree)

1. Go to [merchant.cashfree.com](https://merchant.cashfree.com) and sign up
2. Navigate to **Developers** → **Test Credentials**
3. Copy your sandbox credentials:

```env
CASHFREE_APP_ID=TEST123456789
CASHFREE_SECRET_KEY=cfsk_test_xxx
CASHFREE_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_CASHFREE_ENV=sandbox
```

#### C. Push Notifications (VAPID Keys)

Generate VAPID keys for web push notifications:

```bash
npx web-push generate-vapid-keys
```

Copy the output to your `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BHxxx...
VAPID_PRIVATE_KEY=xxx...
```

#### D. JWT Secret

Generate a secure random secret:

```bash
openssl rand -base64 32
```

Add it to `.env.local`:

```env
JWT_SECRET=your-generated-secret-here
```

#### E. Application URL

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3️⃣ Initialize Database

Push the database schema to Supabase:

```bash
npx prisma db push
```

This creates all the necessary tables (Student, Cafeteria, MenuItem, Order, etc.)

### 4️⃣ Seed the Database

Populate the database with demo data:

```bash
npm run db:seed
```

This creates:
- 3 cafeterias (Samridhi, Canteen Main, E Block)
- 20+ menu items with images
- Staff accounts for testing
- Sample combo and Priority Pass items

### 5️⃣ Run the Development Server

```bash
npm run dev
```

The application will start at **http://localhost:3000**

## 🎯 Testing the Application

### Student Flow

1. Open **http://localhost:3000**
2. You'll see the barcode scanner login page
3. Click **"Can't scan? Enter manually"** at the bottom
4. Enter a valid registration number format: `BL.EN.U4CSE22001`
5. You'll be redirected to the cafeteria selection page
6. Select a cafeteria to browse the menu
7. Add items to cart and proceed to checkout
8. Complete the payment flow (sandbox mode)
9. Track your order in real-time

### Staff Flow

1. Open **http://localhost:3000/staff/login**
2. Login with default credentials:
   - **Email:** `admin@amrita.edu`
   - **Password:** `admin123`
3. You'll see the kitchen dashboard with Kanban board
4. Manage orders by updating their status
5. Orders update in real-time for students

## 📱 Testing PWA Features

### Install as PWA

1. Open the app in Chrome or Edge
2. After 30 seconds, you'll see an install banner
3. Click "Install" to add to home screen
4. The app will work like a native mobile app

### Test Offline Mode

1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Select **Offline** from the throttling dropdown
4. The app will serve cached menu data

### Test Push Notifications

1. Grant notification permission when prompted
2. Place an order as a student
3. Update the order status as staff
4. You'll receive a push notification on the student device

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with demo data
npm run db:studio        # Open Prisma Studio (database GUI)

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
```

## 🔍 Verify Your Setup

Run these checks to ensure everything is configured correctly:

### 1. Check Environment Variables

```bash
# All required variables should be set
cat .env.local
```

### 2. Test Database Connection

```bash
# Opens Prisma Studio - a GUI for your database
npm run db:studio
```

### 3. Build the Application

```bash
# Should complete without errors
npm run build
```

### 4. Run Tests

```bash
# All tests should pass
npm test
```

## 🐛 Troubleshooting

### Database Connection Failed

**Problem:** Can't connect to Supabase database

**Solution:**
1. Check that your IP is whitelisted in Supabase
2. Go to **Settings** → **Database** → **Connection Pooling**
3. Verify the connection strings are correct
4. Ensure you're using the pooler URL (port 6543) for `DATABASE_URL`

### Cashfree Payment Errors

**Problem:** Payment integration not working

**Solution:**
1. Verify you're using **sandbox** credentials
2. Check that `NEXT_PUBLIC_CASHFREE_ENV=sandbox`
3. For local webhook testing, use [ngrok](https://ngrok.com):
   ```bash
   ngrok http 3000
   ```
4. Update webhook URL in Cashfree dashboard

### Push Notifications Not Working

**Problem:** Not receiving push notifications

**Solution:**
1. Ensure VAPID keys are correctly generated
2. Check browser console for errors
3. Verify notification permission is granted
4. Test in Chrome or Firefox (Safari has limited support)
5. Push notifications require HTTPS in production

### Build Errors

**Problem:** `npm run build` fails

**Solution:**
1. Delete `.next` folder: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npm run lint`
4. Ensure all environment variables are set

## 📚 Next Steps

Now that your app is running:

1. **Explore the codebase:**
   - Check `app/` for pages and API routes
   - Review `src/components/` for UI components
   - Look at `prisma/schema.prisma` for database structure

2. **Customize the app:**
   - Update cafeteria names in `prisma/seed.ts`
   - Add your own menu items
   - Customize colors in `tailwind.config.ts`

3. **Deploy to production:**
   - Use [Vercel](https://vercel.com) for easy deployment
   - Update environment variables for production
   - Switch Cashfree to production mode
   - Set up proper domain and SSL

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Cashfree Documentation](https://docs.cashfree.com)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## 💡 Tips

- Use **Prisma Studio** (`npm run db:studio`) to view and edit database records
- Check the **Network** tab in DevTools to debug API calls
- Use **React DevTools** to inspect component state
- Enable **Service Worker** in DevTools to test PWA features
- Use **Lighthouse** to audit PWA performance

## 🆘 Need Help?

If you encounter issues:
1. Check the [SETUP.md](./SETUP.md) for detailed configuration
2. Review the [Design Document](.kiro/specs/amrita-feast-pwa-v4/design.md)
3. Check the [Requirements Document](.kiro/specs/amrita-feast-pwa-v4/requirements.md)
4. Look at existing tests for usage examples

---

**Happy Coding! 🚀**
