# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (recommended)
- PostgreSQL 14+ (if not using Docker)

---

## Option 1: Docker (Recommended - Fastest)

### 1. Start All Services
```bash
cd ecommerce-admin-panel
docker-compose up -d
```

### 2. Run Database Setup
```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed sample data
docker-compose exec backend npx prisma db seed
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

### 4. Login Credentials
- **Super Admin**: admin@example.com / password123
- **Store Owner**: owner@store1.com / password123

---

## Option 2: Manual Setup

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development server
npm run start:dev
```

Backend will run on http://localhost:3001

### Frontend Setup
```bash
cd admin-panel

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

---

## Quick Test

1. **Login** at http://localhost:3000/login
   - Email: admin@example.com
   - Password: password123

2. **View Dashboard** - See stats and recent orders

3. **Manage Products** - Navigate to Products page

4. **View Orders** - Check order management

5. **Customer List** - View customer data

---

## Common Commands

### Backend
```bash
# Start dev server
npm run start:dev

# Build for production
npm run build

# Run tests
npm run test

# View database
npx prisma studio
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up -d --build
```

---

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml
# Backend: Change 3001:3001
# Frontend: Change vite.config.ts port
```

### Module Not Found
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. **Explore the API** - Visit http://localhost:3001/api
2. **Read Documentation** - Check README.md
3. **Customize** - Modify code to fit your needs
4. **Deploy** - See deployment section in README.md

---

**Need Help?** Check IMPLEMENTATION_COMPLETE.md for detailed information.
