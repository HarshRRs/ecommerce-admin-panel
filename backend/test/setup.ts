import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * Create a test application instance
 */
export async function createTestApp(moduleMetadata: any): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule(moduleMetadata).compile();

  const app = moduleFixture.createNestApplication();

  // Apply same middleware as production
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

/**
 * Mock Prisma Service for testing
 */
export const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  store: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  order: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  customer: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

/**
 * Mock Cache Service for testing
 */
export const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  delPattern: jest.fn(),
  exists: jest.fn(),
  wrap: jest.fn(),
  storeKey: jest.fn(),
  invalidateStore: jest.fn(),
  invalidateStoreEntity: jest.fn(),
};

/**
 * Test data factories
 */
export const testFactory = {
  user: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    role: 'STAFF',
    storeId: 'test-store-id',
    isActive: true,
    forcePasswordChange: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  store: (overrides = {}) => ({
    id: 'test-store-id',
    name: 'Test Store',
    slug: 'test-store',
    currency: 'USD',
    timezone: 'UTC',
    language: 'en',
    status: 'ACTIVE',
    type: 'ECOMMERCE',
    ownerId: 'test-owner-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  product: (overrides = {}) => ({
    id: 'test-product-id',
    storeId: 'test-store-id',
    sku: 'TEST-SKU-001',
    name: 'Test Product',
    slug: 'test-product',
    type: 'SIMPLE',
    status: 'ACTIVE',
    basePrice: 99.99,
    stock: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  customer: (overrides = {}) => ({
    id: 'test-customer-id',
    storeId: 'test-store-id',
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    status: 'ACTIVE',
    totalOrders: 0,
    totalSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  order: (overrides = {}) => ({
    id: 'test-order-id',
    storeId: 'test-store-id',
    orderNumber: 'ORD-001',
    customerId: 'test-customer-id',
    status: 'PENDING',
    subtotal: 99.99,
    tax: 10.0,
    shipping: 5.0,
    discount: 0,
    total: 114.99,
    currency: 'USD',
    paymentStatus: 'PENDING',
    shippingAddress: {},
    billingAddress: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};

/**
 * Cleanup function for tests
 */
export async function cleanupTest(app: INestApplication) {
  if (app) {
    await app.close();
  }
}
