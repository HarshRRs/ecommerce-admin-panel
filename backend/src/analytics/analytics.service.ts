import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) { }

  async getDashboardStats(storeId: string) {
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      recentOrders,
    ] = await Promise.all([
      this.prisma.prisma.order.count({ where: { storeId } }),
      this.prisma.prisma.order.aggregate({
        where: { storeId, status: 'DELIVERED' },
        _sum: { total: true },
      }),
      this.prisma.prisma.customer.count({ where: { storeId } }),
      this.prisma.prisma.product.count({ where: { storeId } }),
      this.prisma.prisma.order.findMany({
        where: { storeId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum?.total || 0,
      totalCustomers,
      totalProducts,
      recentOrders,
    };
  }

  async getSalesReport(storeId: string, startDate?: Date, endDate?: Date) {
    const where: any = { storeId, status: 'DELIVERED' };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [orders, revenue, ordersByDay] = await Promise.all([
      this.prisma.prisma.order.count({ where }),
      this.prisma.prisma.order.aggregate({
        where,
        _sum: { total: true, subtotal: true, tax: true, shipping: true },
      }),
      this.prisma.prisma.order.groupBy({
        by: ['createdAt'],
        where,
        _sum: { total: true },
        _count: true,
      }),
    ]);

    return {
      totalOrders: orders,
      totalRevenue: revenue._sum.total || 0,
      subtotal: revenue._sum.subtotal || 0,
      taxes: revenue._sum.tax || 0,
      shipping: revenue._sum.shipping || 0,
      ordersByDay: this.groupByDate(ordersByDay),
    };
  }

  async getTopProducts(storeId: string, limit: number = 10) {
    const topProducts = await this.prisma.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { storeId, status: 'DELIVERED' },
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: limit,
    });

    const productIds = topProducts.map((item) => item.productId);
    const products = await this.prisma.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true, basePrice: true },
    });

    return topProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        product,
        quantitySold: item._sum.quantity || 0,
        revenue: item._sum.total || 0,
      };
    });
  }

  async getCustomerStats(storeId: string) {
    const [totalCustomers, customersWithOrders, topCustomers] = await Promise.all([
      this.prisma.prisma.customer.count({ where: { storeId } }),
      this.prisma.prisma.customer.count({
        where: {
          storeId,
          orders: { some: {} },
        },
      }),
      this.prisma.prisma.customer.findMany({
        where: { storeId },
        include: {
          orders: {
            where: { status: 'DELIVERED' },
            select: { total: true },
          },
        },
        take: 10,
      }),
    ]);

    const topCustomersWithStats = topCustomers
      .map((customer) => ({
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
        },
        totalOrders: customer.orders.length,
        totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.total), 0),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return {
      totalCustomers,
      customersWithOrders,
      topCustomers: topCustomersWithStats,
    };
  }

  private groupByDate(data: any[]) {
    const grouped = new Map();

    data.forEach((item) => {
      const date = new Date(item.createdAt).toISOString().split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, { date, total: 0, count: 0 });
      }
      const entry = grouped.get(date);
      entry.total += item._sum.total || 0;
      entry.count += item._count || 0;
    });

    return Array.from(grouped.values());
  }
}
