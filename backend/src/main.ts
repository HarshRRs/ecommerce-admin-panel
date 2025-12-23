import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Log service configuration status
  console.log('\n========================================')
  console.log('🚀 E-COMMERCE ADMIN PANEL STARTING');
  console.log('========================================');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Port:', process.env.PORT || 3000);
  console.log('\n--- Core Services (Required) ---');
  console.log(process.env.DATABASE_URL ? '✅ Database: Connected' : '❌ Database: MISSING (CRITICAL!)');
  console.log(process.env.JWT_SECRET ? '✅ JWT Auth: Configured' : '❌ JWT: MISSING (CRITICAL!)');
  console.log('\n--- Optional Services ---');
  console.log(process.env.REDIS_URL
    ? '✅ Redis: Enabled (caching active)'
    : '⚠️  Redis: Disabled (no caching, background jobs disabled)');
  console.log(process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT
    ? '✅ ImageKit: Enabled (image uploads will work)'
    : '⚠️  ImageKit: Disabled (image uploads will fail)');
  console.log(process.env.EMAIL_API_KEY
    ? '✅ Email (Resend): Enabled (notifications will send)'
    : '⚠️  Email: Disabled (notifications logged only)');
  console.log(process.env.STRIPE_SECRET_KEY
    ? '✅ Stripe: Enabled (payments active)'
    : '⚠️  Stripe: Disabled (payments unavailable)');
  console.log('========================================\n');

  // Enable CORS
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://localhost:3001'];

  console.log('--- CORS Configuration ---');
  console.log('Allowed Origins:', allowedOrigins);
  console.log('-------------------------');

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Idempotency-Key',
  });

  // Security Headers
  app.use(helmet());

  // Compression
  app.use(compression());

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger Documentation Setup
  if (process.env.NODE_ENV !== 'production') {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
    const config = new DocumentBuilder()
      .setTitle('E-commerce Admin Panel API')
      .setDescription('The Universal E-commerce Admin Panel API description')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Stores', 'Store management endpoints')
      .addTag('Products', 'Product catalog endpoints')
      .addTag('Orders', 'Order processing endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'E-commerce API Docs',
    });
    console.log(`📚 API Documentation available at: http://localhost:${process.env.PORT || 3000}/api/docs`);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
