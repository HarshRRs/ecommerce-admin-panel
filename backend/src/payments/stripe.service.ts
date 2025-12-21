import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../common/services/security.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private securityService: SecurityService,
  ) {}

  private async getStripeInstance(
    storeId: string,
  ): Promise<{ stripe: Stripe; webhookSecret: string }> {
    const store = (await this.prisma.prisma.store.findUnique({
      where: { id: storeId },
      select: {
        stripeApiKey: true,
        stripeWebhookSecret: true,
        stripeOwnershipConfirmed: true,
        status: true,
      } as any,
    })) as any;

    if (!store) throw new NotFoundException('Store not found');
    if (store.status === 'SUSPENDED') {
      throw new BadRequestException('Store is suspended. Payments are disabled.');
    }
    if (!store.stripeOwnershipConfirmed) {
      throw new BadRequestException(
        'Stripe ownership must be confirmed by the store owner before processing payments.',
      );
    }
    if (!store.stripeApiKey) {
      throw new BadRequestException('Stripe API Key is missing for this store.');
    }

    try {
      const apiKey = this.securityService.decrypt(store.stripeApiKey);
      const webhookSecret = store.stripeWebhookSecret
        ? this.securityService.decrypt(store.stripeWebhookSecret)
        : '';

      return {
        stripe: new Stripe(apiKey, {
          apiVersion: '2023-10-16' as any,
        }),
        webhookSecret,
      };
    } catch (error) {
      this.logger.error(
        `Failed to decrypt Stripe keys for store ${storeId}: ${(error as any).message}`,
      );
      throw new BadRequestException('Invalid Stripe configuration for this store.');
    }
  }

  async createPaymentIntent(orderId: string, amount: number, currency: string = 'usd') {
    const order = await this.prisma.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const { stripe } = await this.getStripeInstance(order.storeId);

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: { orderId, storeId: order.storeId },
      });

      await this.prisma.prisma.payment.create({
        data: {
          orderId,
          storeId: order.storeId,
          amount,
          currency,
          gateway: 'STRIPE',
          gatewayTransactionId: paymentIntent.id,
          status: 'PENDING',
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error(`Stripe Payment Intent Error: ${(error as any).message}`);
      throw error;
    }
  }

  async handleWebhook(storeId: string, sig: string, body: Buffer) {
    const { stripe, webhookSecret } = await this.getStripeInstance(storeId);

    if (!sig || !webhookSecret) {
      this.logger.error(`Missing stripe signature or webhook secret for store ${storeId}`);
      throw new BadRequestException('Missing stripe signature or webhook secret');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook Error: ${(err as any).message}`);
      throw new Error(`Webhook Error: ${(err as any).message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await this.handlePaymentSuccess(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object;
        await this.handlePaymentFailure(failedIntent);
        break;
      }
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) return;

    this.logger.log(`Payment succeeded for order ${orderId}`);

    // Update payment record
    await this.prisma.prisma.payment.updateMany({
      where: { gatewayTransactionId: paymentIntent.id },
      data: { status: 'PAID', paidAt: new Date() },
    });

    // Update order status
    await this.prisma.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSING' },
    });
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) return;

    this.logger.warn(`Payment failed for order ${orderId}`);

    // Update payment record
    await this.prisma.prisma.payment.updateMany({
      where: { gatewayTransactionId: paymentIntent.id },
      data: { status: 'FAILED' },
    });

    // Update order status
    await this.prisma.prisma.order.update({
      where: { id: orderId },
      data: { status: 'FAILED' },
    });
  }
}
