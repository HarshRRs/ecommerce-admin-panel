import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async create(createOrderDto: CreateOrderDto, storeId: string) {
    const { items, couponId, ...orderData } = createOrderDto;

    // Validate customer belongs to store
    const customer = await this.prisma.customer.findFirst({
      where: { id: createOrderDto.customerId, storeId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, storeId },
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      const itemTotal = Number(item.price) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal,
        name: product.name,
        sku: product.sku,
      });
    }

    const shipping = orderData.shipping || 0;
    const tax = orderData.tax || 0;
    let discount = 0;

    // Apply coupon if provided
    if (couponId) {
      const coupon = await this.prisma.coupon.findFirst({
        where: { id: couponId, storeId, status: 'ACTIVE' },
      });

      if (coupon) {
        if (coupon.type === 'PERCENTAGE') {
          discount = (subtotal * (Number(coupon.value))) / 100;
        } else {
          discount = Number(coupon.value);
        }
      }
    }

    const total = subtotal + shipping + tax - discount;
    const orderNumber = `ORD-${Date.now()}`;

    return this.prisma.order.create({
      data: {
        ...orderData,
        orderNumber,
        storeId,
        subtotal,
        shipping,
        tax,
        discount,
        total,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        customer: true,
      },
    });
  }

  async findAll(storeId: string, filters?: any) {
    const where: any = { storeId };

    if (filters?.status) where.status = filters.status;
    if (filters?.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { customer: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, storeId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, storeId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        customer: true,
        payments: true,
        shipments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, storeId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, storeId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        ...updateOrderDto,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        customer: true,
      },
    });
  }

  async cancel(id: string, storeId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, storeId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
      throw new BadRequestException('Cannot cancel this order');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
