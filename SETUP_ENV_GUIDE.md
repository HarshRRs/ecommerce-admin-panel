### 🛠️ Environment Setup Instructions

Because `.env` files are hidden and protected, please copy the content below into new files in your project folders.

#### 1. Backend Configuration
Create a file at: `backend/.env`
Paste this content:

```env
# Server Configuration
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS="http://localhost:5173,https://your-frontend-vercel-url.vercel.app"

# Database (Supabase)
# IMPORTANT: Replace [YOUR-PASSWORD] with your actual Supabase database password
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.tnxlewonihsgkumcfpgv.supabase.co:5432/postgres"

# Authentication
JWT_SECRET="rD/QwscwZG+Pio2xtjBObT9w8tYf5EenPpk+wDQOgvQ="
JWT_REFRESH_SECRET="lO9m8sS+p7X9V1rU5V6G7S8f/n5B+L4M3R2X1Z0YvU8="

# 🔑 Security (CRITICAL for Multi-tenant Safety)
# Generate a random 32-character string for AES-256 encryption
ENCRYPTION_KEY="[YOUR-32-CHARACTER-SECRET-KEY-HERE]"

# Frontend URL
FRONTEND_URL="http://localhost:5173"
APP_URL="http://localhost:3000"

# 📤 Email (Resend.com Free Tier Recommended)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# ImageKit Storage
IMAGEKIT_PUBLIC_KEY="public_zXClHb9aieT2DFsZFgTPW5UfhLE="
IMAGEKIT_PRIVATE_KEY="private_e9/L8lGltcMncQ3w6IoEfH6AoEM="
# IMPORTANT: Replace [YOUR_ID] with your ImageKit ID (found in ImageKit Dashboard)
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/[YOUR_ID]"

# Stripe Payments (Fallback Global Keys - Overridden by per-store settings)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Supabase API (For other services)
SUPABASE_URL="https://tnxlewonihsgkumcfpgv.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRueGxld29uaWhzZ2t1bWNmcGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMDY0ODUsImV4cCI6MjA4MTU4MjQ4NX0.UHZ9Q_GExBxenQNGkSiuKgoQaF0xX9tCfKAGDj3neP8"
```

### 🚨 Production Verification Checklist
- [ ] **Database**: Run `npx prisma db push` to apply schema updates (Store Status, Stripe Confirmation, Reset Tokens).
- [ ] **Security**: Ensure `ENCRYPTION_KEY` is 32 characters long.
- [ ] **Emails**: Verify `RESEND_API_KEY` to enable password resets.
- [ ] **Payments**: Each store owner must enter their own keys in **Settings > Payments**.


#### 2. Frontend Configuration
Create a file at: `frontend/.env`
Paste this content:

```env
VITE_API_URL="http://localhost:3000/api/v1"
```

---
**Next Step after setting these up:**
Run `npx prisma db push` in the `backend` folder to update your Supabase database!
