import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../system/email/email.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            prisma: {
              user: { findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn(), create: jest.fn() },
              store: { findUnique: jest.fn(), create: jest.fn() },
              $transaction: jest.fn((cb) => cb({
                user: { create: jest.fn(), update: jest.fn() },
                store: { create: jest.fn() },
              })),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
            verify: jest.fn(() => ({ userId: 'test-id' })),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              if (key === 'JWT_EXPIRATION') return '1h';
              if (key === 'EMAIL_API_KEY') return 'test-api-key';
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return null;
            }),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendPasswordReset: jest.fn(),
            sendWelcomeEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
