# 🔧 Fix Database Connection Error

## Problem
```
Error: P1001: Can't reach database server
```

This means your database password is incorrect or the connection string is wrong.

## Solution

### Step 1: Get Your Real Database Password

1. Go to your Supabase project: https://supabase.com/dashboard/project/uyetlwrsrftzdfjzrkmmi
2. Click on **Settings** (gear icon in sidebar)
3. Click on **Database**
4. Scroll down to **Connection string**
5. Click on **Connection pooling** tab
6. You'll see a connection string like:
   ```
   postgresql://postgres.uyetlwrsrftzdfjzrkmm:[YOUR-PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
   ```
7. **IMPORTANT:** Click the eye icon to reveal your actual password
8. Copy the entire connection string

### Step 2: Update Your .env File

Open your `.env` file and replace the DATABASE_URL and DIRECT_URL with the correct passwords:

```env
# Replace [YOUR-PASSWORD] with your actual Supabase password
DATABASE_URL="postgresql://postgres.uyetlwrsrftzdfjzrkmm:[YOUR-PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.uyetlwrsrftzdfjzrkmm:[YOUR-PASSWORD]@db.uyetlwrsrftzdfjzrkmm.supabase.co:5432/postgres"
```

### Step 3: Also Update .env.local

```bash
# Copy the same values to .env.local
cp .env .env.local
```

### Step 4: Test the Connection

```bash
npx prisma db push
```

If successful, you should see:
```
✔ Database synchronized with Prisma schema
```

## Alternative: Reset Your Database Password

If you can't find your password, you can reset it:

1. Go to **Settings** → **Database** in Supabase
2. Scroll to **Database password**
3. Click **Reset database password**
4. Copy the new password
5. Update your `.env` and `.env.local` files

## Quick Fix Command

Once you have the correct password, run:

```bash
# Update .env file with correct password
# Then run:
npx prisma db push
npm run db:seed
npm run dev
```

## Still Having Issues?

### Check 1: Verify Connection String Format

Your connection strings should look like this:

```env
# Pooler (port 6543) - for DATABASE_URL
DATABASE_URL="postgresql://postgres.uyetlwrsrftzdfjzrkmm:REAL_PASSWORD_HERE@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct (port 5432) - for DIRECT_URL  
DIRECT_URL="postgresql://postgres.uyetlwrsrftzdfjzrkmm:REAL_PASSWORD_HERE@db.uyetlwrsrftzdfjzrkmm.supabase.co:5432/postgres"
```

### Check 2: Verify Your IP is Allowed

1. Go to **Settings** → **Database** in Supabase
2. Scroll to **Connection pooling**
3. Make sure your IP is not blocked
4. You can temporarily allow all IPs by adding `0.0.0.0/0` (not recommended for production)

### Check 3: Test Connection with psql

```bash
# Test if you can connect directly
psql "postgresql://postgres.uyetlwrsrftzdfjzrkmm:YOUR_PASSWORD@db.uyetlwrsrftzdfjzrkmm.supabase.co:5432/postgres"
```

## Need Your Actual Password?

I can see your Supabase project ID is: `uyetlwrsrftzdfjzrkmm`

To get your password:
1. Visit: https://supabase.com/dashboard/project/uyetlwrsrftzdfjzrkmm/settings/database
2. Look for "Database password" section
3. Click "Reset database password" if you don't remember it
4. Copy the new password and update both `.env` and `.env.local`

---

**After fixing, run:**
```bash
npx prisma db push
npm run db:seed
npm run dev
```
