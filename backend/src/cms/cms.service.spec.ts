import { Test, TestingModule } from '@nestjs/testing';
import { CmsService } from './cms.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CmsService', () => {
  let service: CmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsService,
        {
          provide: PrismaService,
          useValue: {
            prisma: {
              page: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                findFirst: jest.fn(),
              },
              banner: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                findFirst: jest.fn(),
              },
              blogPost: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                findFirst: jest.fn(),
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<CmsService>(CmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
