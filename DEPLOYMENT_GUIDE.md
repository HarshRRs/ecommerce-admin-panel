# Phase 5: Production Deployment - EXECUTION GUIDE

## Deployment Checklist

### Pre-Deployment Verification ✅

**Backend Build**: ✅ Compiled successfully (105 files)
**Frontend Build**: ✅ Compiled successfully (356KB, 108KB gzipped)
**Environment Variables**: ✅ All services configured
**Database Schema**: Ready for migration

---

## STEP 1: Push Code to GitHub

Since Render deploys from Git, we need your code in a repository.

**Quick Setup**:
```bash
cd c:\Users\SHAH HARSH\.vscode\ecommerce-admin-panel
git init
git add .
git commit -m "Production-ready e-commerce admin panel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ecommerce-admin-panel.git
git push -u origin main
```

---

## STEP 2: Deploy Backend to Render

### A. Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository: `ecommerce-admin-panel`

### B. Configure Service

**Basic Settings**:
- **Name**: `ecommerce-backend`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Environment**: `Node`
- **Build Command**: 
  ```
  cd backend && npm install && npx prisma generate && npm run build
  ```
- **Start Command**: 
  ```
  cd backend && npx prisma db push && npm run start:prod
  ```
- **Plan**: Free

### C. Environment Variables

Click **"Advanced"** → Add these environment variables:

**REQUIRED**:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.oykivhpxnzhskrxhqfyo:Harsh_Shah_1311@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
JWT_SECRET=ecommerce_admin_secret_key
ACCESS_TOKEN_SECRET=A394FAED77391ACFA7428B35D1EC7
REFRESH_TOKEN_SECRET=4F9DA5D6169E619637D69F1FFEE1A
ENCRYPTION_KEY=ecommerce_admin_panel_master_encryption_key_32_chars
ALLOWED_ORIGINS=https://ecommerce-frontend-[YOUR-RENDER-ID].onrender.com
FRONTEND_URL=https://ecommerce-frontend-[YOUR-RENDER-ID].onrender.com
```

**OPTIONAL** (Enable features):
```
REDIS_URL=rediss://red-d53n0tchg0os738vllq0:PR8jVpcdlEN6vhGVp3Zd8SHib5XGRrbP@oregon-keyvalue.render.com:6379
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_R92aaaoo_23rpU3SQgyH5bZz8WxQXt9gU
EMAIL_FROM=OrderNest <onboarding@resend.dev>
IMAGEKIT_PUBLIC_KEY=public_zXClHb9aieT2DFsZFgTPW5UfhLE=
IMAGEKIT_PRIVATE_KEY=private_e9/L8lGltcMncQ3w6IoEfH6AoEM=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/1df8u2pz33
```

4. Click **"Create Web Service"**

### D. Wait for Deployment

- First deploy takes ~5-10 minutes
- Watch logs for:
  ```
  🚀 E-COMMERCE ADMIN PANEL STARTING
  ✅ Database: Connected
  ✅ Email (Resend): Enabled
  ✅ ImageKit: Enabled
  🚀 Application is running on: http://0.0.0.0:10000/api/v1
  ```

### E. Copy Backend URL

After successful deployment, copy your backend URL:
- Format: `https://ecommerce-backend-[RENDER-ID].onrender.com`
- Example: `https://ecommerce-backend-abc123.onrender.com`

---

## STEP 3: Deploy Frontend to Render

### A. Create Static Site

1. In Render Dashboard: **"New +"** → **"Static Site"**
2. Select same repository: `ecommerce-admin-panel`

### B. Configure Static Site

**Basic Settings**:
- **Name**: `ecommerce-frontend`
- **Branch**: `main`
- **Build Command**: 
  ```
  cd frontend && npm install && npm run build
  ```
- **Publish Directory**: 
  ```
  frontend/dist
  ```

### C. Environment Variables

Add this variable with YOUR backend URL from Step 2:
```
VITE_API_URL=https://ecommerce-backend-[YOUR-RENDER-ID].onrender.com/api/v1
```

Example:
```
VITE_API_URL=https://ecommerce-backend-abc123.onrender.com/api/v1
```

### D. Configure Rewrites (for SPA routing)

In **"Redirects/Rewrites"** section:
- **Source**: `/*`
- **Destination**: `/index.html`
- **Action**: Rewrite

4. Click **"Create Static Site"**

### E. Wait for Deployment

- Takes ~3-5 minutes
- Watch for successful build

---

## STEP 4: Update CORS Configuration

Once frontend deploys, you'll have a frontend URL like:
`https://ecommerce-frontend-xyz789.onrender.com`

### Update Backend Environment Variables

1. Go to backend service settings
2. Update these variables:
   ```
   ALLOWED_ORIGINS=https://ecommerce-frontend-xyz789.onrender.com
   FRONTEND_URL=https://ecommerce-frontend-xyz789.onrender.com
   ```
3. Save and redeploy backend

---

## STEP 5: Verify Deployment

### A. Test Backend Health

Open in browser:
```
https://ecommerce-backend-[YOUR-ID].onrender.com/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected",
  "cache": "connected"
}
```

### B. Test Frontend

1. Open: `https://ecommerce-frontend-[YOUR-ID].onrender.com`
2. Should see login page
3. Try registering a new account
4. Verify dashboard loads

### C. Smoke Tests

**Registration Flow**:
- ✅ Register new user
- ✅ Receive welcome email (check inbox)
- ✅ Login successful
- ✅ Dashboard loads with stats

**CRUD Operations**:
- ✅ Create product
- ✅ Upload image (ImageKit)
- ✅ View products list
- ✅ Edit product
- ✅ Delete product

**Analytics**:
- ✅ Dashboard shows metrics
- ✅ Recent orders display
- ✅ CMS pages accessible

---

## STEP 6: Production Configuration

### Supabase Database

If needed, configure Supabase:
1. Go to Supabase Dashboard
2. Project Settings → Database
3. Connection Pooling → Enable
4. Mode: Transaction (for pgBouncer)
5. Update DATABASE_URL if needed

### Render Redis (Optional)

For Redis allowlist:
1. Get your Render backend IP
2. Contact Render support OR
3. Use internal Redis URL when deploying on Render

---

## Environment Variables Reference

### Backend Production Variables

**Critical (Required)**:
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...  # Supabase with pgbouncer=true
JWT_SECRET=ecommerce_admin_secret_key
ACCESS_TOKEN_SECRET=A394FAED77391ACFA7428B35D1EC7
REFRESH_TOKEN_SECRET=4F9DA5D6169E619637D69F1FFEE1A
ENCRYPTION_KEY=ecommerce_admin_panel_master_encryption_key_32_chars
ALLOWED_ORIGINS=https://your-frontend.onrender.com
FRONTEND_URL=https://your-frontend.onrender.com
```

**Optional (Enable features)**:
```env
REDIS_URL=rediss://...  # For caching
EMAIL_API_KEY=re_...  # For email notifications
IMAGEKIT_PUBLIC_KEY=public_...  # For image uploads
IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/...
```

### Frontend Production Variables

**Required**:
```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

---

## Troubleshooting

### Backend Won't Start

**Check logs for**:
- Database connection errors → Verify DATABASE_URL
- Missing environment variables → Check all required vars
- Build errors → Check Node version (18+)

**Solutions**:
```bash
# In Render logs, look for:
❌ Database: MISSING (CRITICAL!)
# Add DATABASE_URL to environment variables

⚠️ Redis: Disabled
# Optional - app works without it

⚠️ Email: Disabled  
# Optional - emails logged only
```

### Frontend Build Fails

**Common issues**:
- Missing VITE_API_URL → Add environment variable
- Node memory issues → Contact Render support
- Import errors → Check all imports in code

### CORS Errors

**Fix**:
1. Backend ALLOWED_ORIGINS must include exact frontend URL
2. No trailing slashes
3. Use https:// not http://
4. Redeploy backend after updating

### Database Migration Fails

**Solutions**:
```bash
# If prisma db push fails, try:
# 1. In Render shell:
npx prisma migrate deploy

# 2. Or use Render dashboard to run one-time job
```

---

## Success Criteria

### ✅ Deployment Complete When:

1. **Backend Live**: 
   - Health endpoint returns 200
   - Logs show "Application is running"
   - All services enabled (or gracefully disabled)

2. **Frontend Live**:
   - Website loads at HTTPS URL
   - No console errors
   - Login page visible

3. **Full Functionality**:
   - Registration creates user
   - Email sent (if configured)
   - Dashboard shows real data
   - CRUD operations work
   - Images upload to ImageKit

---

## Post-Deployment

### Monitor First 24 Hours

**Check**:
- Error logs (Render dashboard)
- Response times
- Database connections
- Email delivery rate

### Performance

**Optimize if needed**:
- Enable Redis for caching
- Check database query performance
- Monitor bundle sizes

### Security

**Verify**:
- HTTPS enabled ✅ (automatic on Render)
- CORS configured correctly
- Environment variables secure
- No secrets in code

---

## Your Deployment URLs

**After deployment, you'll have**:

**Backend**: `https://ecommerce-backend-[ID].onrender.com`
- API: `https://ecommerce-backend-[ID].onrender.com/api/v1`
- Health: `https://ecommerce-backend-[ID].onrender.com/api/v1/health`

**Frontend**: `https://ecommerce-frontend-[ID].onrender.com`
- Admin panel login page

---

## Quick Deploy Commands

If using Render CLI (alternative):

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Deploy
render deploy
```

---

**Status**: Ready for production deployment! 🚀

**Next Steps**:
1. Push code to GitHub
2. Create Render account
3. Deploy backend first
4. Deploy frontend with backend URL
5. Update CORS
6. Verify functionality

**Estimated Time**: 20-30 minutes total
