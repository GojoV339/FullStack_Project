# ✅ Setup Checklist

Use this checklist to ensure everything is configured correctly.

## Prerequisites

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (optional)

## Environment Setup

### Database (Supabase)
- [ ] Created Supabase account
- [ ] Created new project
- [ ] Copied `DATABASE_URL` (port 6543)
- [ ] Copied `DIRECT_URL` (port 5432)
- [ ] Copied `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copied `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Payment Gateway (Cashfree)
- [ ] Created Cashfree merchant account
- [ ] Got sandbox credentials
- [ ] Copied `CASHFREE_APP_ID`
- [ ] Copied `CASHFREE_SECRET_KEY`
- [ ] Copied `CASHFREE_WEBHOOK_SECRET`
- [ ] Set `NEXT_PUBLIC_CASHFREE_ENV=sandbox`

### Push Notifications
- [ ] Generated VAPID keys (`npx web-push generate-vapid-keys`)
- [ ] Copied `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- [ ] Copied `VAPID_PRIVATE_KEY`

### Security
- [ ] Generated JWT secret (`openssl rand -base64 32`)
- [ ] Copied `JWT_SECRET`

### Application
- [ ] Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`

## Installation

- [ ] Ran `npm install`
- [ ] No errors during installation

## Database Setup

- [ ] Ran `npx prisma db push`
- [ ] Tables created successfully
- [ ] Ran `npm run db:seed`
- [ ] Demo data loaded (3 cafeterias, 20+ items)

## Verification

- [ ] Ran `npm run build` (no errors)
- [ ] Ran `npm run lint` (no errors)
- [ ] Ran `npm test` (all tests pass)
- [ ] Opened Prisma Studio (`npm run db:studio`)
- [ ] Verified data in database

## Running the App

- [ ] Ran `npm run dev`
- [ ] Server started on port 3000
- [ ] Opened http://localhost:3000
- [ ] Login page loads correctly

## Testing Features

### Student Flow
- [ ] Clicked "Can't scan? Enter manually"
- [ ] Entered registration number (e.g., `BL.EN.U4CSE22001`)
- [ ] Redirected to cafeteria selection
- [ ] Selected a cafeteria
- [ ] Browsed menu items
- [ ] Added items to cart
- [ ] Proceeded to checkout
- [ ] Saw payment timer (5 minutes)
- [ ] Completed payment flow
- [ ] Redirected to order tracker
- [ ] Saw order status stepper

### Staff Flow
- [ ] Opened http://localhost:3000/staff/login
- [ ] Logged in with `admin@amrita.edu` / `admin123`
- [ ] Saw Kanban dashboard
- [ ] Saw orders in columns (CONFIRMED, PREPARING, READY)
- [ ] Updated order status
- [ ] Verified real-time updates

### PWA Features
- [ ] Waited 30 seconds for install banner
- [ ] Clicked "Install" button
- [ ] App installed on home screen
- [ ] Opened as standalone app
- [ ] Tested offline mode (DevTools → Network → Offline)
- [ ] Cached data loaded successfully

### Push Notifications
- [ ] Granted notification permission
- [ ] Placed order as student
- [ ] Updated status as staff
- [ ] Received push notification
- [ ] Notification clicked → opened tracker

## Production Readiness

- [ ] All environment variables documented
- [ ] Database migrations tested
- [ ] Seed data verified
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Build succeeds
- [ ] Performance audit passed (Lighthouse)

## Deployment (Optional)

- [ ] Chose hosting platform (Vercel recommended)
- [ ] Updated environment variables for production
- [ ] Changed Cashfree to production mode
- [ ] Set up custom domain
- [ ] Configured SSL certificate
- [ ] Updated webhook URLs
- [ ] Tested production deployment

---

## Status Summary

**Total Items:** 70+
**Completed:** ___
**Remaining:** ___

---

## Quick Commands Reference

```bash
# Install
npm install

# Database
npx prisma db push
npm run db:seed
npm run db:studio

# Development
npm run dev

# Testing
npm test
npm run lint
npm run build

# Production
npm run build
npm run start
```

---

## Need Help?

If any checkbox fails:
1. Check [QUICKSTART.md](./QUICKSTART.md) for detailed instructions
2. Review [SETUP.md](./SETUP.md) for configuration help
3. See [RUN.md](./RUN.md) for quick commands
4. Check troubleshooting section in each guide
