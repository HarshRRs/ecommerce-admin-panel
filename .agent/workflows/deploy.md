---
description: how to deploy the application to production
---

To deploy the multi-tenant Ecommerce Admin Panel for free, follow these steps:

### 1. Repository Setup
1. Initialize a Git repository in the root folder: `git init`
2. Create a `.gitignore` file (one is already provided in subfolders).
3. Push your code to a private GitHub repository.

### 2. Backend Deployment (Railway.app recommended)
Railway is excellent for NestJS and integrates perfectly with GitHub.
1. Sign up for [Railway.app](https://railway.app).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select your repository.
4. Go to **Variables** and add all variables from the `backend/.env` (refer to [SETUP_ENV_GUIDE.md](../../SETUP_ENV_GUIDE.md)).
   - **CRITICAL**: Ensure `PORT` is set to `3000` (or leave as default, Railway handles this).
   - **CRITICAL**: Set `NODE_ENV=production`.
   - **CRITICAL**: Provide a 32-character `ENCRYPTION_KEY`.
5. Railway will automatically detect the NestJS app and run `npm run build` and `npm run start:prod`.

### 3. Alternative Backend (Render.com)
If using Render:
1. Create **New Web Service**.
2. Settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
3. Add environment variables from `backend/.env`.

### 4. Database Sync (Supabase)
1. Ensure your `DATABASE_URL` in Railway points to your Supabase instance.
2. In your local terminal, run the final schema push to make sure Supabase is up to date:
   ```bash
   cd backend
   npx prisma db push
   ```

### 5. Frontend Deployment (Vercel recommended)
Vercel is the gold standard for Vite/React apps.
1. Sign up for [Vercel](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. In **Project Settings > Environment Variables**, add:
   - `VITE_API_URL`: The URL of your deployed backend (e.g., `https://ecommerce-admin-panel-yhjs.onrender.com/api/v1`).
5. Click **Deploy**.

### 6. Final Verification
1. Open your Vercel URL.
2. Log in with your admin credentials.
3. Go to **Settings > Payments** and verify you can save a store's Stripe keys (which tests the `SecurityService` encryption).
