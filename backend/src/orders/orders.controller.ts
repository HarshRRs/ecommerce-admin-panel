import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.ordersService.create(createOrderDto, storeId);
  }

  @Get()
  findAll(
    @CurrentUser('storeId') storeId: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('fulfillmentStatus') fulfillmentStatus?: string,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAll(storeId, {
      status,
      paymentStatus,
      fulfillmentStatus,
      customerId,
      search,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.ordersService.findOne(id, storeId);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.ordersService.update(id, updateOrderDto, storeId);
  }

  @Post(':id/cancel')
  @Roles(Role.OWNER, Role.MANAGER)
  cancel(
    @Param('id') id: string,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.ordersService.cancel(id, storeId);
  }
}
