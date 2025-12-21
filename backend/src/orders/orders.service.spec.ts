import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            prisma: {
              order: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
              product: { findFirst: jest.fn() },
              customer: { findFirst: jest.fn() },
              coupon: { findFirst: jest.fn() },
            },
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
