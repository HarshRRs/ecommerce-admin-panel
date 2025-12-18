# Universal E-commerce Admin Panel

A comprehensive, reusable multi-tenant e-commerce administration system built with modern technologies.

## 🚀 Project Overview

This is a **universal, multi-tenant e-commerce admin panel** designed to manage multiple client stores from a single instance. It supports diverse product types (physical, digital, services), provides a frontend-agnostic API, and scales horizontally.

### Key Features

- ✅ **Multi-Tenant Architecture**: Manage multiple stores with isolated data
- ✅ **Comprehensive Product Management**: Simple, variable, and digital products
- ✅ **Order Processing**: Complete order lifecycle management
- ✅ **Customer Management**: Profiles, addresses, and segmentation
- ✅ **Payment Integration**: Stripe, PayPal, Razorpay, Cash on Delivery
- ✅ **Shipping Management**: Zones, rates, and carrier integration
- ✅ **Marketing Tools**: Coupons, flash sales, featured products
- ✅ **Analytics & Reports**: Sales metrics, customer insights, inventory reports
- ✅ **CMS**: Pages, banners, blog system
- ✅ **System Administration**: Audit logs, error tracking, activity monitoring

## 🏗️ Architecture

### Technology Stack

**Backend:**
- NestJS (TypeScript)
- PostgreSQL (via Prisma ORM)
- Redis (caching & sessions)
- JWT Authentication
- Docker containerization

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS + ShadCN UI
- React Query (server state)
- React Router v6

### Project Structure

```
ecommerce-admin-panel/
├── backend/                    # NestJS API server
│   ├── prisma/
│   │   ├── schema.prisma      # Complete database schema
│   │   └── seed.ts            # Seed data with demo store
│   ├── src/
│   │   ├── auth/              # Authentication & JWT
│   │   ├── common/            # Shared utilities, decorators, guards
│   │   ├── prisma/            # Prisma service
│   │   ├── users/             # User management (to be implemented)
│   │   ├── stores/            # Store/tenant management (to be implemented)
│   │   ├── products/          # Product catalog (to be implemented)
│   │   ├── orders/            # Order processing (to be implemented)
│   │   ├── customers/         # Customer management (to be implemented)
│   │   ├── payments/          # Payment integration (to be implemented)
│   │   ├── shipping/          # Shipping management (to be implemented)
│   │   ├── coupons/           # Marketing & promotions (to be implemented)
│   │   ├── analytics/         # Reports & analytics (to be implemented)
│   │   └── cms/               # Content management (to be implemented)
│   ├── .env.example           # Environment variable template
│   └── package.json
│
└── admin-panel/               # React frontend (to be initialized)
    └── (Frontend files to be created)
```

## 📦 Installation & Setup

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 15.x
- Redis >= 7.x
- Docker (optional, recommended)

### Backend Setup

1. **Navigate to backend directory:**
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
   # Edit .env with your database credentials
   ```

4. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

5. **Run migrations:**
   ```bash
   npm run prisma:migrate
   ```

6. **Seed database with demo data:**
   ```bash
   npm run prisma:seed
   ```

7. **Start development server:**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`

### Frontend Setup (To Be Completed)

```bash
cd admin-panel
npm install
npm run dev
```

## 🗄️ Database Schema

### Core Entities

The system includes comprehensive database models:

- **User & Authentication**: Users, roles, permissions
- **Store (Multi-Tenant)**: Store settings, configurations
- **Product Catalog**: Products, variants, categories, attributes
- **Orders**: Orders, order items, status tracking
- **Customers**: Customer profiles, addresses
- **Payments**: Payment records, gateway integration
- **Shipping**: Zones, rates, shipments, tracking
- **Marketing**: Coupons, discounts, featured products
- **CMS**: Pages, banners, blog posts
- **System**: Audit logs for compliance

See `prisma/schema.prisma` for the complete schema definition.

## 🔐 Authentication

### Default Credentials (After Seeding)

```
Super Admin:
  Email: admin@example.com
  Password: admin123

Store Owner:
  Email: owner@demostore.com
  Password: admin123
```

### JWT Configuration

- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration
- **Algorithm**: HS256
- **Storage**: httpOnly cookies for refresh tokens

## 🚀 API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Stores (To Be Implemented)
- `GET /stores` - List all stores
- `POST /stores` - Create new store
- `GET /stores/:id` - Get store details
- `PATCH /stores/:id` - Update store
- `DELETE /stores/:id` - Delete store

### Products (To Be Implemented)
- `GET /products` - List products with filters
- `POST /products` - Create product
- `GET /products/:id` - Get product details
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `POST /products/bulk-import` - Import products via CSV

### Orders (To Be Implemented)
- `GET /orders` - List orders with filters
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id/status` - Update order status
- `POST /orders/:id/refund` - Process refund

...and more for customers, payments, shipping, coupons, analytics, and CMS.

## 🎯 Development Workflow

### Running Prisma Studio
```bash
npm run prisma:studio
```
Access at `http://localhost:5555` to view and edit database records.

### Database Migrations
```bash
# Create new migration
npm run prisma:migrate

# Apply migrations in production
npx prisma migrate deploy
```

### Code Generation
```bash
# Generate Prisma Client after schema changes
npm run prisma:generate
```

## 🐳 Docker Deployment (To Be Completed)

```bash
# Build and run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📝 Environment Variables

Required environment variables (see `.env.example`):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Payment Gateways
STRIPE_SECRET_KEY=""
PAYPAL_CLIENT_ID=""
RAZORPAY_KEY_ID=""

# File Storage
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""

# Email
SENDGRID_API_KEY=""
```

## 🔧 Available Scripts

### Backend
```bash
npm run start:dev          # Start in development mode
npm run build              # Build for production
npm run start:prod         # Start production server
npm run lint               # Run ESLint
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run database migrations
npm run prisma:seed        # Seed database
npm run prisma:studio      # Open Prisma Studio
```

## 🏆 Implementation Status

### ✅ Completed
- [x] Project structure initialization
- [x] Backend NestJS setup with TypeScript
- [x] Prisma ORM configuration
- [x] Complete database schema (15+ models)
- [x] Seed data with demo store
- [x] Common decorators and utilities
- [x] Authentication module structure

### 🚧 In Progress
- [ ] Authentication implementation (JWT strategy, guards, RBAC)
- [ ] Store management module
- [ ] Product management module
- [ ] Order processing module
- [ ] Customer management module
- [ ] Payment integration
- [ ] Shipping management
- [ ] Marketing & coupons
- [ ] Analytics & reporting
- [ ] CMS module
- [ ] System administration
- [ ] Docker configuration
- [ ] React frontend initialization
- [ ] Frontend authentication
- [ ] Dashboard UI
- [ ] Product management UI
- [ ] Order management UI
- [ ] Customer management UI
- [ ] Settings UI

## 📖 Design Document

For comprehensive architecture details, data models, and specifications, refer to:
`.qoder/quests/universal-ecommerce-admin-panel.md`

## 🤝 Contributing

This is a starter template. To continue development:

1. Implement remaining backend modules following NestJS patterns
2. Create REST endpoints for each entity
3. Add proper error handling and validation
4. Implement unit and integration tests
5. Initialize and build React frontend
6. Create responsive UI components
7. Integrate with backend API
8. Add Docker configuration
9. Set up CI/CD pipeline

## 📄 License

This project is for educational and demonstration purposes.

## 🔗 Useful Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.com/)

---

**Note**: This is a foundational implementation. Complete the remaining modules following the patterns established in the auth module and database schema. Each module should include:
- DTOs for request validation
- Service layer for business logic
- Controller for API endpoints
- Proper error handling
- Unit tests
- API documentation
