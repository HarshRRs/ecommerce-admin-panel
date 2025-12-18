# Quick Start Guide

Get the Universal E-commerce Admin Panel up and running in minutes!

## 🚀 Option 1: Docker (Recommended)

The easiest way to get started. Docker will set up PostgreSQL, Redis, and the backend API automatically.

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Steps

1. **Clone and navigate to the project:**
   ```bash
   cd ecommerce-admin-panel
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations:**
   ```bash
   docker-compose exec backend npm run prisma:migrate
   ```

4. **Seed the database:**
   ```bash
   docker-compose exec backend npm run prisma:seed
   ```

5. **Access the API:**
   - API: http://localhost:3000
   - Health check: http://localhost:3000 (should return "Hello World!")

6. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

7. **Stop services:**
   ```bash
   docker-compose down
   ```

### Default Login Credentials

After seeding, use these credentials:

```
Super Admin:
  Email: admin@example.com
  Password: admin123

Store Owner:
  Email: owner@demostore.com
  Password: admin123
```

## 🛠️ Option 2: Manual Setup

For developers who want full control or don't use Docker.

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 15+ running
- Redis 7+ running

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update:
   ```env
   DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ecommerce_admin?schema=public"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="your-secret-key-here"
   JWT_REFRESH_SECRET="your-refresh-secret-here"
   ```

4. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

5. **Run migrations:**
   ```bash
   npm run prisma:migrate
   ```

6. **Seed database:**
   ```bash
   npm run prisma:seed
   ```

7. **Start development server:**
   ```bash
   npm run start:dev
   ```

8. **Verify it's running:**
   - Open: http://localhost:3000
   - You should see "Hello World!"

### Prisma Studio (Database GUI)

View and edit your database records:

```bash
npm run prisma:studio
```

Access at: http://localhost:5555

## 📡 Testing the API

### Using cURL

**Test Health:**
```bash
curl http://localhost:3000
```

**Login (will be implemented):**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Using Postman or Thunder Client

1. Import the endpoints listed in README.md
2. Set base URL to `http://localhost:3000/api/v1`
3. Use the login endpoint to get a JWT token
4. Add the token to Authorization header: `Bearer YOUR_TOKEN`

## 🗄️ Database

### View Database with Prisma Studio
```bash
npm run prisma:studio
```

### Reset Database
```bash
npm run prisma:migrate reset
```
This will:
- Drop the database
- Create it again
- Run all migrations
- Run seed

### Create New Migration
```bash
npm run prisma:migrate
```

## 🎯 Next Steps

1. **Implement Authentication Module**
   - Complete JWT strategy in `src/auth/`
   - Add guards and decorators
   - Test login/logout endpoints

2. **Build Other Modules**
   - Products (`src/products/`)
   - Orders (`src/orders/`)
   - Customers (`src/customers/`)
   - And more...

3. **Initialize Frontend**
   ```bash
   cd admin-panel
   npm create vite@latest . -- --template react-ts
   npm install
   ```

4. **Add More Features**
   - Payment gateway integration
   - File upload to S3
   - Email notifications
   - Background job processing

## 🐛 Troubleshooting

### Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database exists: `createdb ecommerce_admin`

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
- Change PORT in `.env` to another port (e.g., 3001)
- Or kill the process using port 3000:
  ```bash
  # Linux/Mac
  lsof -ti:3000 | xargs kill
  
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Prisma Client Not Generated

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
npm run prisma:generate
```

### Redis Connection Error

**Error:** `Redis connection failed`

**Solution:**
- Ensure Redis is running:
  ```bash
  # Linux/Mac
  redis-cli ping
  
  # Docker
  docker run -d -p 6379:6379 redis:7-alpine
  ```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Full Design Document](.qoder/quests/universal-ecommerce-admin-panel.md)

## 🆘 Getting Help

1. Check the [README.md](README.md) for detailed information
2. Review the [Design Document](.qoder/quests/universal-ecommerce-admin-panel.md)
3. Inspect database schema in `prisma/schema.prisma`
4. Look at seed data in `prisma/seed.ts` for examples

---

**Ready to code?** Start implementing the authentication module or any other module from the design document!
