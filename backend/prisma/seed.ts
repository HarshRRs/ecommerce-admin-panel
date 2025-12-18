import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo store
  const demoStore = await prisma.store.upsert({
    where: { slug: 'demo-store' },
    update: {},
    create: {
      name: 'Demo Store',
      slug: 'demo-store',
      currency: 'USD',
      timezone: 'America/New_York',
      language: 'en',
      status: 'ACTIVE',
      ownerId: '00000000-0000-0000-0000-000000000000', // Will update after creating owner
    },
  });

  console.log('✅ Created demo store:', demoStore.name);

  // Create super admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Created super admin:', superAdmin.email);

  // Create store owner
  const storeOwner = await prisma.user.upsert({
    where: { email: 'owner@demostore.com' },
    update: {},
    create: {
      email: 'owner@demostore.com',
      password: hashedPassword,
      firstName: 'Store',
      lastName: 'Owner',
      role: 'OWNER',
      storeId: demoStore.id,
      isActive: true,
    },
  });

  console.log('✅ Created store owner:', storeOwner.email);

  // Update store with ownerId
  await prisma.store.update({
    where: { id: demoStore.id },
    data: { ownerId: storeOwner.id },
  });

  // Create sample categories
  const electronics = await prisma.category.create({
    data: {
      storeId: demoStore.id,
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
    },
  });

  const smartphones = await prisma.category.create({
    data: {
      storeId: demoStore.id,
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest smartphones',
      parentId: electronics.id,
    },
  });

  console.log('✅ Created categories');

  // Create sample attributes
  const sizeAttr = await prisma.attribute.create({
    data: {
      storeId: demoStore.id,
      name: 'Size',
      slug: 'size',
      type: 'select',
      values: ['S', 'M', 'L', 'XL'],
    },
  });

  const colorAttr = await prisma.attribute.create({
    data: {
      storeId: demoStore.id,
      name: 'Color',
      slug: 'color',
      type: 'select',
      values: ['Red', 'Blue', 'Green', 'Black', 'White'],
    },
  });

  console.log('✅ Created attributes');

  // Create sample products
  const product1 = await prisma.product.create({
    data: {
      storeId: demoStore.id,
      sku: 'PHONE-001',
      name: 'Premium Smartphone',
      slug: 'premium-smartphone',
      description: 'High-end smartphone with amazing features',
      type: 'SIMPLE',
      status: 'ACTIVE',
      basePrice: 699.99,
      compareAtPrice: 899.99,
      costPrice: 500.00,
      taxable: true,
      weight: 0.2,
      categoryId: smartphones.id,
      stock: 50,
      lowStockThreshold: 10,
      isFeatured: true,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      storeId: demoStore.id,
      sku: 'TSHIRT-001',
      name: 'Classic T-Shirt',
      slug: 'classic-tshirt',
      description: 'Comfortable cotton t-shirt',
      type: 'VARIABLE',
      status: 'ACTIVE',
      basePrice: 29.99,
      taxable: true,
      weight: 0.3,
      categoryId: electronics.id,
    },
  });

  // Create variants for variable product
  await prisma.productVariant.createMany({
    data: [
      {
        productId: product2.id,
        sku: 'TSHIRT-001-S-RED',
        price: 29.99,
        stock: 20,
        attributes: { size: 'S', color: 'Red' },
        status: 'ACTIVE',
      },
      {
        productId: product2.id,
        sku: 'TSHIRT-001-M-BLUE',
        price: 29.99,
        stock: 25,
        attributes: { size: 'M', color: 'Blue' },
        status: 'ACTIVE',
      },
      {
        productId: product2.id,
        sku: 'TSHIRT-001-L-BLACK',
        price: 34.99,
        stock: 15,
        attributes: { size: 'L', color: 'Black' },
        status: 'ACTIVE',
      },
    ],
  });

  console.log('✅ Created products and variants');

  // Create sample customer
  const customer = await prisma.customer.create({
    data: {
      storeId: demoStore.id,
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      status: 'ACTIVE',
      totalOrders: 0,
      totalSpent: 0,
    },
  });

  // Create customer address
  await prisma.address.create({
    data: {
      customerId: customer.id,
      type: 'BOTH',
      isDefault: true,
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      phone: '+1234567890',
    },
  });

  console.log('✅ Created customer with address');

  // Create sample coupon
  await prisma.coupon.create({
    data: {
      storeId: demoStore.id,
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      minOrderValue: 50,
      usageLimit: 100,
      status: 'ACTIVE',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  console.log('✅ Created coupon');

  // Create shipping zone
  const usZone = await prisma.shippingZone.create({
    data: {
      storeId: demoStore.id,
      name: 'United States',
      countries: ['US'],
    },
  });

  // Create shipping rates
  await prisma.shippingRate.createMany({
    data: [
      {
        zoneId: usZone.id,
        method: 'Standard',
        rateType: 'FLAT',
        cost: 5.99,
        estimatedDays: 5,
        isActive: true,
      },
      {
        zoneId: usZone.id,
        method: 'Express',
        rateType: 'FLAT',
        cost: 15.99,
        estimatedDays: 2,
        isActive: true,
      },
    ],
  });

  console.log('✅ Created shipping zones and rates');

  // Create sample page
  await prisma.page.create({
    data: {
      storeId: demoStore.id,
      title: 'About Us',
      slug: 'about-us',
      content: '<h1>About Our Store</h1><p>Welcome to our e-commerce store!</p>',
      metaTitle: 'About Us',
      metaDescription: 'Learn more about our store',
      status: 'PUBLISHED',
    },
  });

  console.log('✅ Created CMS page');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Login credentials:');
  console.log('   Super Admin: admin@example.com / admin123');
  console.log('   Store Owner: owner@demostore.com / admin123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
