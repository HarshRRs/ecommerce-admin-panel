# Backup & Recovery Guide

## Database (PostgreSQL / Supabase)
Supabase handles daily backups automatically. However, for a 10/10 SaaS, we recommend manual snapshots before major schema migrations.

### Manual Backup
```bash
# Export schema and data
pg_dump -h db.your-supabase-id.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql
```

### Recovery Procedure
1. Create a fresh project on Supabase.
2. Restore the backup:
```bash
psql -h db.new-project-id.supabase.co -U postgres -d postgres < backup_20251220.sql
```

## Cache (Redis)
Redis is used for idempotency and background jobs. In case of failure, clear the cache. Idempotency keys older than 24 hours can be safely purged.

## Environment Variables
Always keep a secure copy of the `.env.production` in a password manager (e.g., 1Password or Bitwarden).
Critical keys:
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `DATABASE_URL`
- `REDIS_URL`

## Disaster Recovery (DR)
In case of Render.com regional outage:
1. Deploy the backend to a secondary provider (e.g., Koyeb or Railway).
2. Update the frontend `VITE_API_URL` to point to the new backend.
3. Update Stripe Webhook URLs in the Stripe Dashboard to the new endpoint.
