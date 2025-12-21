import { Test, TestingModule } from '@nestjs/testing';
import { SystemService } from './system.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SystemService', () => {
  let service: SystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemService,
        {
          provide: PrismaService,
          useValue: {
            prisma: {
              auditLog: { findMany: jest.fn(), create: jest.fn() },
              store: { count: jest.fn() },
              user: { count: jest.fn() },
              product: { count: jest.fn() },
              order: { count: jest.fn(), aggregate: jest.fn() },
              customer: { count: jest.fn() },
              $queryRaw: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SystemService>(SystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
