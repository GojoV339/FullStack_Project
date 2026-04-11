# ▶️ How to Run Amrita Feast PWA

## Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
# (See QUICKSTART.md for detailed instructions)
```

### Step 3: Initialize Database
```bash
# Push database schema
npx prisma db push

# Seed with demo data
npm run db:seed
```

### Step 4: Run the App
```bash
npm run dev
```

**🎉 Done! Open http://localhost:3000**

---

## Default Login Credentials

### Student Login
- Go to: `http://localhost:3000`
- Click: **"Can't scan? Enter manually"**
- Enter: `BL.EN.U4CSE22001` (or any valid format)

### Staff Login
- Go to: `http://localhost:3000/staff/login`
- Email: `admin@amrita.edu`
- Password: `admin123`

---

## Essential Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run db:studio` | Open database GUI |
| `npm test` | Run tests |

---

## Ports Used

- **3000** - Next.js application
- **5555** - Prisma Studio (when running `npm run db:studio`)

---

## What You'll See

### 1. Student App (http://localhost:3000)
```
Login → Cafeteria Selection → Menu → Cart → Checkout → Payment → Order Tracker
```

### 2. Staff Dashboard (http://localhost:3000/staff/login)
```
Login → Kanban Board (CONFIRMED | PREPARING | READY)
```

---

## Troubleshooting

### "Cannot connect to database"
```bash
# Check your DATABASE_URL in .env.local
# Make sure Supabase project is running
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 already in use"
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

---

## Need More Help?

📖 Read [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions
📖 Read [SETUP.md](./SETUP.md) for environment configuration
📖 Read [README.md](./README.md) for project overview
