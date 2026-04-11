# Amrita Feast PWA - Setup Guide

## Environment Configuration

This project requires several environment variables to be configured before running. Follow the steps below to set up your development environment.

### 1. Create `.env.local` File

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

### 2. Configure Environment Variables

#### Database (Supabase PostgreSQL)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection strings:
   - `DATABASE_URL`: Connection pooling URL (port 6543)
   - `DIRECT_URL`: Direct connection URL (port 5432)

#### Supabase Realtime

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon/public key

#### Cashfree Payment Gateway

1. Create a free account at [merchant.cashfree.com](https://merchant.cashfree.com)
2. Go to **Developers** → **Test Credentials**
3. Copy the following:
   - `CASHFREE_APP_ID`: Your test app ID
   - `CASHFREE_SECRET_KEY`: Your test secret key
   - `CASHFREE_WEBHOOK_SECRET`: Your webhook secret
4. Set `NEXT_PUBLIC_CASHFREE_ENV=sandbox` for testing

#### Web Push Notifications (VAPID Keys)

Generate VAPID keys using the web-push library:

```bash
npx web-push generate-vapid-keys
```

Copy the output:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: Public key
- `VAPID_PRIVATE_KEY`: Private key

#### JWT Secret

Generate a secure random secret (minimum 32 characters):

```bash
openssl rand -base64 32
```

Copy the output to `JWT_SECRET`

#### Application URL

Set the base URL for your application:
- Development: `http://localhost:3000`
- Production: Your deployed URL (e.g., `https://amritafeast.com`)

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Database

Run Prisma migrations to create database tables:

```bash
npx prisma migrate dev
```

Seed the database with initial data:

```bash
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration Files

### `next.config.js`

Configured with:
- **next-pwa**: PWA support with service worker
- **Runtime caching**: 
  - Food images from Supabase (CacheFirst, 7 days)
  - Menu API data (StaleWhileRevalidate, 5 minutes)
- **Image optimization**: Remote patterns for Supabase storage

### `tailwind.config.ts`

Configured with custom warm color palette:
- **Primary**: `#FF6B35` (saffron-orange)
- **Accent**: `#FFB347` (turmeric yellow)
- **Surface Warm**: `#FFF8F4` (warm off-white)
- Custom animations for smooth interactions
- Mobile-first responsive breakpoints

## Verification

To verify your setup is correct:

1. Check that all environment variables are set in `.env.local`
2. Run `npm run build` to ensure the build succeeds
3. Check for any TypeScript errors: `npm run lint`
4. Test database connection: `npx prisma studio`

## Troubleshooting

### Database Connection Issues

- Ensure your IP is whitelisted in Supabase (Settings → Database → Connection Pooling)
- Verify the connection strings are correct
- Check that the database exists and migrations have run

### Cashfree Payment Issues

- Ensure you're using sandbox credentials for testing
- Verify the webhook URL is accessible (use ngrok for local testing)
- Check that the webhook secret matches

### Push Notification Issues

- VAPID keys must be generated using `web-push generate-vapid-keys`
- Ensure the public key is accessible in the browser (NEXT_PUBLIC_ prefix)
- Test in a browser that supports push notifications (Chrome, Firefox)

## Next Steps

After completing the setup:

1. Review the [Requirements Document](.kiro/specs/amrita-feast-pwa-v4/requirements.md)
2. Review the [Design Document](.kiro/specs/amrita-feast-pwa-v4/design.md)
3. Check the [Tasks List](.kiro/specs/amrita-feast-pwa-v4/tasks.md)
4. Start implementing features according to the task order

## Support

For issues or questions:
- Check the design document for architecture details
- Review the requirements document for feature specifications
- Consult the Prisma schema for database structure
