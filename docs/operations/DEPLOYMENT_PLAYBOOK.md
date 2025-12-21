# Production Deployment Playbook

## CI/CD Workflow
The project is configured for Auto-Deploy on Render.com when pushing to the `main` branch.

### Deployment Checklist
1. **Pre-Deployment**:
    - [ ] Run `npm run test` (backend & frontend).
    - [ ] Run `npm run lint`.
    - [ ] Ensure `npx prisma migrate status` is UP.
2. **Deployment**:
    - [ ] Push to `main`.
    - [ ] Monitor Render Dashboard for build logs.
    - [ ] Verify `api/v1/health` returns 200 OK.
3. **Post-Deployment**:
    - [ ] Test login/register flow.
    - [ ] Verify Stripe webhook triggers (if applicable).
    - [ ] Check `AuditLog` for the deployment user update.

## Redis Configuration
1. **Render Internal URL**: Use `redis://red-...:6379` for services in the same region.
2. **External URL**: Use `rediss://<user>:<pass>@...` for local development or remote connection.
3. **BullMQ**: The application automatically uses `REDIS_URL` for Background Jobs and Caching.

## Secrets Rotation
We recommend rotating secrets every 90 days.
1. Update `JWT_SECRET` in Render Dashboard.
2. Deployment will trigger automatically.
3. Users will be logged out and must re-authenticate.

## Escalation Path
- **Level 1**: check Render logs.
- **Level 2**: Verify Supabase database connection limit.
- **Level 3**: Check Redis queue backlog (`BullMQ`).
