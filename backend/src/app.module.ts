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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        ALLOWED_ORIGINS: Joi.string().required(),
        STRIPE_SECRET_KEY: Joi.string().optional(),
        IMAGEKIT_PUBLIC_KEY: Joi.string().required(),
        IMAGEKIT_PRIVATE_KEY: Joi.string().required(),
        IMAGEKIT_URL_ENDPOINT: Joi.string().required(),
        EMAIL_PROVIDER: Joi.string().valid('resend').default('resend'),
        EMAIL_API_KEY: Joi.string().required(),
        EMAIL_FROM: Joi.string().default('noreply@ordernest.com'),
        ENCRYPTION_KEY: Joi.string().required(),
      }),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
      },
    }),
    BullModule.forRoot({
      connection: process.env.REDIS_URL ? {
        url: process.env.REDIS_URL,
      } : {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
      },
    }),
    BackgroundJobsModule,
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
    AnalyticsModule,
    PaymentsModule,
    ShippingModule,
    SystemModule,
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
