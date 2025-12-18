import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemService {
  constructor(private prisma: PrismaService) { }

  async getAuditLogs(storeId?: string, filters?: any) {
    const where: any = {};

    if (storeId) {
      where.storeId = storeId;
    }

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = { contains: filters.action, mode: 'insensitive' };
    if (filters?.resource) where.resource = { contains: filters.resource, mode: 'insensitive' };

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    return this.prisma.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    });
  }

  async getSystemStats(storeId?: string) {
    const where = storeId ? { storeId } : {};

    const [
      totalStores,
      totalUsers,
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      recentLogs,
    ] = await Promise.all([
      this.prisma.prisma.store.count(),
      this.prisma.prisma.user.count({ where: storeId ? where : undefined }),
      this.prisma.prisma.product.count({ where }),
      this.prisma.prisma.order.count({ where }),
      this.prisma.prisma.customer.count({ where }),
      this.prisma.prisma.order.aggregate({
        where: { ...where, status: 'DELIVERED' },
        _sum: { total: true },
      }),
      this.prisma.prisma.auditLog.findMany({
        where: storeId ? { storeId } : {},
        include: {
          user: {
            select: { email: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return {
      totalStores,
      totalUsers,
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: totalRevenue._sum?.total || 0,
      recentLogs,
    };
  }

  async getUserActivity(userId: string, storeId?: string) {
    const where: any = { userId };
    if (storeId) where.storeId = storeId;

    const logs = await this.prisma.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const summary = {
      totalActions: logs.length,
      actionsByType: {} as Record<string, number>,
      recentActivity: logs.slice(0, 10),
    };

    logs.forEach((log) => {
      const action = log.action;
      summary.actionsByType[action] = (summary.actionsByType[action] || 0) + 1;
    });

    return summary;
  }

  async createAuditLog(data: {
    userId: string;
    storeId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: any;
  }) {
    return this.prisma.prisma.auditLog.create({
      data: {
        userId: data.userId,
        storeId: data.storeId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        changes: data.changes || {},
      },
    });
  }

  async getSystemHealth() {
    try {
      // Check database connection
      await this.prisma.prisma.$queryRaw`SELECT 1`;

      // Get database stats
      const [userCount, storeCount, orderCount] = await Promise.all([
        this.prisma.prisma.user.count(),
        this.prisma.prisma.store.count(),
        this.prisma.prisma.order.count(),
      ]);

      return {
        status: 'healthy',
        database: 'connected',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        stats: {
          users: userCount,
          stores: storeCount,
          orders: orderCount,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
}
