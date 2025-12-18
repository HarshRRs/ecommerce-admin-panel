import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto } from './dto/payment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

import { Public } from '../common/decorators/public.decorator';
import { StripeService } from './stripe.service';
import { Request } from 'express';
import { Headers, Req } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
  ) { }

  @Public()
  @Post('webhook/:storeId')
  async handleWebhook(
    @Param('storeId') storeId: string,
    @Headers('stripe-signature') sig: string,
    @Req() req: any,
  ) {
    return this.stripeService.handleWebhook(storeId, sig, req.rawBody);
  }

  @Post('create-intent')
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  createIntent(
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('currency') currency: string,
  ) {
    return this.stripeService.createPaymentIntent(orderId, amount, currency);
  }

  @Post()
  @Roles(Role.OWNER, Role.MANAGER)
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.paymentsService.create(createPaymentDto, storeId);
  }

  @Post('process')
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  processPayment(
    @Body() processPaymentDto: ProcessPaymentDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.paymentsService.processPayment(processPaymentDto, storeId);
  }

  @Get()
  findAll(
    @CurrentUser('storeId') storeId: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.paymentsService.findAll(storeId, { status, method, orderId });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.paymentsService.findOne(id, storeId);
  }

  @Post(':id/refund')
  @Roles(Role.OWNER, Role.MANAGER)
  refund(
    @Param('id') id: string,
    @Body() refundPaymentDto: RefundPaymentDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.paymentsService.refund(id, refundPaymentDto, storeId);
  }
}
