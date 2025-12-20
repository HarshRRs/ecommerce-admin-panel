import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto } from './dto/payment.dto';
import { PaymentStatus } from '@prisma/client';

// Payment Gateway Interfaces
interface PaymentGateway {
  processPayment(
    amount: number,
    token?: string,
  ): Promise<{ success: boolean; transactionId: string }>;
  refundPayment(transactionId: string, amount: number): Promise<{ success: boolean }>;
}

// Stripe Gateway Implementation (stub)
class StripeGateway implements PaymentGateway {
  async processPayment(
    amount: number,
    token?: string,
  ): Promise<{ success: boolean; transactionId: string }> {
    // In production, integrate with actual Stripe SDK
    return {
      success: true,
      transactionId: `stripe_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  }

  async refundPayment(transactionId: string, amount: number): Promise<{ success: boolean }> {
    return { success: true };
  }
}

// PayPal Gateway Implementation (stub)
class PayPalGateway implements PaymentGateway {
  async processPayment(
    amount: number,
    token?: string,
  ): Promise<{ success: boolean; transactionId: string }> {
    return {
      success: true,
      transactionId: `paypal_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  }

  async refundPayment(transactionId: string, amount: number): Promise<{ success: boolean }> {
    return { success: true };
  }
}

// Cash Gateway (no external processing)
class CashGateway implements PaymentGateway {
  async processPayment(amount: number): Promise<{ success: boolean; transactionId: string }> {
    return {
      success: true,
      transactionId: `cash_${Date.now()}`,
    };
  }

  async refundPayment(transactionId: string, amount: number): Promise<{ success: boolean }> {
    return { success: true };
  }
}

@Injectable()
export class PaymentsService {
  private gateways: Map<string, PaymentGateway>;

  constructor(private prisma: PrismaService) {
    // Initialize payment gateways
    this.gateways = new Map();
    this.gateways.set('STRIPE', new StripeGateway());
    this.gateways.set('PAYPAL', new PayPalGateway());
    this.gateways.set('CASH', new CashGateway());
  }

  async create(createPaymentDto: CreatePaymentDto, storeId: string) {
    // Verify order belongs to store
    const order = await this.prisma.prisma.order.findFirst({
      where: { id: createPaymentDto.orderId, storeId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.prisma.payment.create({
      data: {
        orderId: createPaymentDto.orderId,
        storeId,
        amount: createPaymentDto.amount,
        gateway: createPaymentDto.gateway,
        gatewayTransactionId: createPaymentDto.gatewayTransactionId,
        currency: createPaymentDto.currency || 'USD',
        status: 'PENDING',
      },
    });
  }

  async processPayment(processPaymentDto: ProcessPaymentDto, storeId: string) {
    const { orderId, gateway: gatewayName, token } = processPaymentDto;

    // Verify order
    const order = await this.prisma.prisma.order.findFirst({
      where: { id: orderId, storeId },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if already paid
    const existingPayment = order.payments.find((p) => p.status === 'PAID');
    if (existingPayment) {
      throw new BadRequestException('Order already paid');
    }

    // Get payment gateway
    const gateway = this.gateways.get(gatewayName.toUpperCase());
    if (!gateway) {
      throw new BadRequestException('Invalid payment method');
    }

    try {
      // Process payment through gateway
      const result = await gateway.processPayment(Number(order.total), token);

      if (result.success) {
        // Create payment record
        const payment = await this.prisma.prisma.payment.create({
          data: {
            orderId,
            storeId,
            amount: order.total,
            gateway: gatewayName,
            gatewayTransactionId: result.transactionId,
            currency: order.currency,
            status: 'PAID',
          },
        });

        // Update order payment status
        await this.prisma.prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'PAID' },
        });

        return payment;
      } else {
        throw new BadRequestException('Payment processing failed');
      }
    } catch (error) {
      // Create failed payment record
      await this.prisma.prisma.payment.create({
        data: {
          orderId,
          storeId,
          amount: order.total,
          gateway: gatewayName,
          currency: order.currency,
          status: 'FAILED',
          metadata: { error: error.message },
        },
      });

      throw new BadRequestException('Payment failed: ' + error.message);
    }
  }

  async findAll(storeId: string, filters?: any) {
    const where: any = { order: { storeId } };

    if (filters?.status) where.status = filters.status;
    if (filters?.gateway) where.gateway = filters.gateway;
    if (filters?.orderId) where.orderId = filters.orderId;

    return this.prisma.prisma.payment.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            customer: {
              select: { email: true, firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, storeId: string) {
    const payment = await this.prisma.prisma.payment.findFirst({
      where: {
        id,
        order: { storeId },
      },
      include: {
        order: {
          include: {
            customer: true,
            items: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async refund(id: string, refundPaymentDto: RefundPaymentDto, storeId: string) {
    const payment = await this.prisma.prisma.payment.findFirst({
      where: {
        id,
        order: { storeId },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'PAID') {
      throw new BadRequestException('Can only refund paid payments');
    }

    if (refundPaymentDto.amount > Number(payment.amount)) {
      throw new BadRequestException('Refund amount exceeds payment amount');
    }

    // Get payment gateway
    const gateway = this.gateways.get(payment.gateway.toUpperCase());
    if (!gateway) {
      throw new BadRequestException('Payment gateway not available');
    }

    try {
      // Process refund through gateway
      const result = await gateway.refundPayment(
        payment.gatewayTransactionId || '',
        refundPaymentDto.amount,
      );

      if (result.success) {
        // Update payment status
        const updatedPayment = await this.prisma.prisma.payment.update({
          where: { id },
          data: {
            status: 'REFUNDED',
            metadata: { refundReason: refundPaymentDto.reason || 'Refunded' },
          },
        });

        // Update order payment status
        await this.prisma.prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'REFUNDED' },
        });

        return updatedPayment;
      } else {
        throw new BadRequestException('Refund processing failed');
      }
    } catch (error) {
      throw new BadRequestException('Refund failed: ' + error.message);
    }
  }
}
