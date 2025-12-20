import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { CreateShipmentDto, UpdateShipmentDto, TrackingUpdateDto } from './dto/shipping.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  create(@Body() createShipmentDto: CreateShipmentDto, @CurrentUser('storeId') storeId: string) {
    return this.shippingService.create(createShipmentDto, storeId);
  }

  @Get()
  findAll(
    @CurrentUser('storeId') storeId: string,
    @Query('status') status?: string,
    @Query('carrier') carrier?: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.shippingService.findAll(storeId, { status, carrier, orderId });
  }

  @Get('track/:trackingNumber')
  track(@Param('trackingNumber') trackingNumber: string, @CurrentUser('storeId') storeId: string) {
    return this.shippingService.track(trackingNumber, storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.shippingService.findOne(id, storeId);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.shippingService.update(id, updateShipmentDto, storeId);
  }

  @Post('tracking/update')
  @Roles(Role.OWNER, Role.MANAGER)
  updateTracking(
    @Body() trackingUpdateDto: TrackingUpdateDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.shippingService.updateTracking(trackingUpdateDto, storeId);
  }

  @Post(':id/cancel')
  @Roles(Role.OWNER, Role.MANAGER)
  cancel(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.shippingService.cancel(id, storeId);
  }
}
