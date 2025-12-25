import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { StoreSuspensionGuard } from './common/guards/store-suspension.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './customers/customers.module';
import { CouponsModule } from './coupons/coupons.module';
import { CmsModule } from './cms/cms.module';
import { MediaModule } from './media/media.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PaymentsModule } from './payments/payments.module';
import { ShippingModule } from './shipping/shipping.module';
import { SystemModule } from './system/system.module';
import { CommonModule } from './common/common.module';
import { CacheModule } from './common/services/cache.module';
import { HealthModule } from './health/health.module';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { BackgroundJobsModule } from './common/jobs/background-jobs.module';
import { AuditLogModule } from './system/audit-logs/audit-log.module';
import { EmailModule } from './system/email/email.module';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // Core required - app cannot start without these
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        ALLOWED_ORIGINS: Joi.string().required(),
        ENCRYPTION_KEY: Joi.string().required(),

        // Optional services - app works without these
        REDIS_URL: Joi.string().optional().allow(''),
        IMAGEKIT_PUBLIC_KEY: Joi.string().optional().allow(''),
        IMAGEKIT_PRIVATE_KEY: Joi.string().optional().allow(''),
        IMAGEKIT_URL_ENDPOINT: Joi.string().optional().allow(''),
        EMAIL_API_KEY: Joi.string().optional().allow(''),
        EMAIL_FROM: Joi.string().default('noreply@ordernest.com'),
        EMAIL_PROVIDER: Joi.string().valid('resend').default('resend'),

        // Payment gateway (optional)
        STRIPE_SECRET_KEY: Joi.string().optional().allow(''),

        // Frontend URL (optional, used in emails)
        FRONTEND_URL: Joi.string().optional().default('http://localhost:5173'),
      }),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
      },
    }),
    // Conditionally import BullModule only if Redis is configured
    ...(process.env.REDIS_URL
      ? [
        BullModule.forRoot({
          connection: { url: process.env.REDIS_URL },
        }),
        BackgroundJobsModule,
      ]
      : []),
    AuditLogModule,
    EmailModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    CommonModule,
    CacheModule,
    AuthModule,
    StoresModule,
    ProductsModule,
    OrdersModule,
    CustomersModule,
    CouponsModule,
    CmsModule,
    MediaModule,
    AnalyticsModule,
    PaymentsModule,
    ShippingModule,
    SystemModule,
    ShopModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: StoreSuspensionGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule { }
