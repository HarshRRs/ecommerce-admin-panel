import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    // Soft delete middleware
    this.$use(async (params, next) => {
      // Models that support soft delete
      const softDeleteModels = ['User', 'Store', 'Product', 'Order', 'Customer', 'Coupon'];

      if (softDeleteModels.includes(params.model || '')) {
        // Intercept delete operations
        if (params.action === 'delete') {
          // Change delete to update with deletedAt
          params.action = 'update';
          params.args['data'] = { deletedAt: new Date() };
        }

        if (params.action === 'deleteMany') {
          // Change deleteMany to updateMany with deletedAt
          params.action = 'updateMany';
          if (params.args.data !== undefined) {
            params.args.data['deletedAt'] = new Date();
          } else {
            params.args['data'] = { deletedAt: new Date() };
          }
        }

        // Exclude soft-deleted records from read operations
        if (params.action === 'findUnique' || params.action === 'findFirst') {
          params.action = 'findFirst';
          params.args.where['deletedAt'] = null;
        }

        if (params.action === 'findMany') {
          if (params.args.where) {
            if (params.args.where.deletedAt === undefined) {
              params.args.where['deletedAt'] = null;
            }
          } else {
            params.args['where'] = { deletedAt: null };
          }
        }

        if (params.action === 'count') {
          if (params.args.where) {
            if (params.args.where.deletedAt === undefined) {
              params.args.where['deletedAt'] = null;
            }
          } else {
            params.args['where'] = { deletedAt: null };
          }
        }

        if (params.action === 'update') {
          params.action = 'updateMany';
          params.args.where['deletedAt'] = null;
          const result = await next(params);
          return result.count > 0 ? result : null;
        }

        if (params.action === 'updateMany') {
          if (params.args.where !== undefined) {
            params.args.where['deletedAt'] = null;
          } else {
            params.args['where'] = { deletedAt: null };
          }
        }
      }

      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Utility method to permanently delete (for admin use)
  async hardDelete(model: string, where: any) {
    return (this as any)[model].delete({ where });
  }

  // Utility method to restore soft-deleted records
  async restore(model: string, where: any) {
    return (this as any)[model].updateMany({
      where: { ...where, deletedAt: { not: null } },
      data: { deletedAt: null },
    });
  }

  // Utility method to find including soft-deleted records
  async findWithDeleted(model: string, args: any) {
    return (this as any)[model].findMany(args);
  }
}
