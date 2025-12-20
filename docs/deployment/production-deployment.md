# Zero-Cost Production Deployment Guide

This guide helps you deploy the E-commerce Admin Panel and Backend to free-tier services, suitable for your goal of 0€/month with ~100 stores.

## Architecture
- **Backend**: Render (Web Service) or Railway (Free Trial/Starter)
- **Database**: Neon (Serverless Postgres) or Supabase
- **Redis**: Upstash (Free Tier) or In-memory (if low load)
- **Frontend**: Vercel or Netlify (Static Site Hosting)
- **Storage**: Cloudinary (Free Tier) or Supabase Storage

---

## 1. Database (Neon / Supabase)
1.  **Sign up** for [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2.  **Create a Project**.
3.  **Get Configuration**:
    - Copy the `Postgres Connection String` (for `.env` `DATABASE_URL`).
    - Note: Ensure it fits the `pooling` or `direct` requirements. For Prisma, use the pooled connection string if available.

## 2. Backend (Render / Railway)
We recommend **Render** for a truly free tier (spins down after inactivity).

1.  **Push your code** to GitHub.
2.  **Sign up** for [Render.com](https://render.com).
3.  **New Web Service**:
    - Connect your repository.
    - **Root Directory**: `backend`
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm run start:prod`
    - **Environment Variables**:
        - `DATABASE_URL`: (from Step 1)
        - `JWT_SECRET`: (Generate a strong random string)
        - `JWT_REFRESH_SECRET`: (Generate another)
        - `NODE_ENV`: `production`
        - `API_PREFIX`: `api/v1`
        - `ALLOWED_ORIGINS`: `https://your-frontend-domain.vercel.app` (You'll update this later)
4.  **Deploy**.

## 3. Frontend (Vercel)
1.  **Sign up** for [Vercel.com](https://vercel.com).
2.  **New Project**:
    - Import your repository.
    - **Root Directory**: `admin-panel`
    - **Framework**: Vite (should detect auto)
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
3.  **Environment Variables**:
    - `VITE_API_URL`: The URL of your Render backend (e.g., `https://your-app.onrender.com/api/v1`)
4.  **Deploy**.

## 4. Final Wiring
1.  **Get Vercel Domain**: Copy your new frontend domain (e.g., `https://ecommerce-admin.vercel.app`).
2.  **Update Backend**:
    - Go back to Render Dashboard -> Environment.
    - Update `ALLOWED_ORIGINS` to include your Vercel domain.
    - Redeploy Backend.

## 5. Bulk Import Tips (Free Tier Constraints)
- **Timeouts**: Render free tier sleeps after 15 mins. The first request will be slow (~50s cold start).
- **Import Size**: Split CSVs into chunks of 100-200 products to avoid the 30-100s request timeout limits common on free tiers.
- **Images**: Ensure CSV image columns contain public URLs (e.g., from an existing image host) to avoid upload processing timeouts.

## 6. Zero-Cost Maintenance
- **Database**: Neon/Supabase free tiers have storage limits (e.g., 500MB). Monitor usage.
- **Backend**: Render spins down. Use a free uptimer service (like UptimeRobot) to ping it every 14 mins if you want it to stay "warm" (optional).
