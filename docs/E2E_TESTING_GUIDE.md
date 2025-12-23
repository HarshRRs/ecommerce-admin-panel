# E2E Testing Guide

## Overview
This guide covers how to perform end-to-end testing for the E-commerce Admin Panel.

## Automated E2E Tests

### Running Tests
```bash
cd backend
npm run test:e2e
```

### Current E2E Test Suites
1. **`isolation.e2e-spec.ts`** - Tests multi-tenant data isolation
2. **`auth.e2e-spec.ts`** - Tests authentication flow (registration, login, profile)
3. **`app.e2e-spec.ts`** - Basic health check tests

### Writing New E2E Tests
Use the following template:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Feature Name (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up test data
    await app.close();
  });

  it('should perform expected behavior', async () => {
    const response = await request(app.getHttpServer())
      .post('/endpoint')
      .send({ data: 'test' });

    expect(response.status).toBe(201);
  });
});
```

## Manual E2E Testing

### Prerequisites
1. Start the backend server:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Access Swagger Documentation:
   - URL: `http://localhost:3000/api/docs`
   - This provides an interactive API testing interface

### Critical E2E Flows to Test

#### 1. Registration & Authentication Flow

**Step 1: Register a New Store**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register/store \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User",
    "storeName": "My Test Store",
    "storeSlug": "my-test-store"
  }'
```

Expected Response (201):
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "storeName": "My Test Store"
  }
}
```

**Step 2: Login**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

**Step 3: Get Profile**
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 2. Product Management Flow

**Create Product**
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "TEST-001",
    "name": "Test Product",
    "slug": "test-product",
    "basePrice": 99.99,
    "stock": 100,
    "type": "SIMPLE",
    "status": "ACTIVE"
  }'
```

**List Products**
```bash
curl -X GET "http://localhost:3000/api/v1/products?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3. Multi-Tenancy Isolation Test

**Goal**: Verify that Store A cannot access Store B's data

1. Register Store A and get access token
2. Register Store B and get access token  
3. Create a product in Store B
4. Try to access Store B's product using Store A's token
5. Expected: 404 Not Found (data isolation working)

### Health Check Endpoints

Test application health:
```bash
# Overall health
curl http://localhost:3000/api/v1/health

# Readiness probe
curl http://localhost:3000/api/v1/health/ready

# Liveness probe  
curl http://localhost:3000/api/v1/health/live
```

## Using Swagger UI for Testing

1. Navigate to `http://localhost:3000/api/docs`
2. Click "Authorize" button
3. Enter your Bearer token: `Bearer YOUR_ACCESS_TOKEN`
4. Click "Authorize"
5. Now you can test all endpoints interactively

### Swagger Features
- **Try it out**: Execute real API calls
- **Schemas**: View request/response models
- **Authorization**: Persist Bearer tokens across requests
- **Examples**: See sample requests and responses

## Troubleshooting

### Issue: CORS errors
**Solution**: Ensure `ALLOWED_ORIGINS` environment variable includes your frontend URL

### Issue: 401 Unauthorized
**Solution**: Check if your access token is expired (15min lifetime). Use refresh token to get a new access token.

### Issue: Database connection errors
**Solution**: Verify `DATABASE_URL` is correctly set in `.env`

## Recommended Test Checklist

Before deploying to production, manually verify:

- [ ] User registration works
- [ ] Login/logout works
- [ ] Password reset flow works
- [ ] JWT tokens are properly validated
- [ ] Multi-tenant isolation prevents cross-store data access
- [ ] Product CRUD operations work
- [ ] Order creation and status updates work
- [ ] File uploads work (if ImageKit configured)
- [ ] Email notifications are sent (if email configured)
- [ ] Health endpoints return correct status
- [ ] API rate limiting works (100 req/min per IP)
- [ ] CORS only allows configured origins

## CI/CD Integration

The project includes GitHub Actions workflow (`.github/workflows/ci.yml`) that:
- Runs unit tests on every push
- Runs E2E tests on every push
- Performs security scanning
- Builds Docker images

Ensure all tests pass before merging to `main` branch.
