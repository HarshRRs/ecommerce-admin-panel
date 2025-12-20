import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER)
  create(@Body() createCouponDto: CreateCouponDto, @CurrentUser('storeId') storeId: string) {
    return this.couponsService.create(createCouponDto, storeId);
  }

  @Get()
  findAll(@CurrentUser('storeId') storeId: string, @Query('status') status?: string) {
    return this.couponsService.findAll(storeId, status);
  }

  @Get('validate/:code')
  validateCoupon(@Param('code') code: string, @CurrentUser('storeId') storeId: string) {
    return this.couponsService.findByCode(code, storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.couponsService.findOne(id, storeId);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.couponsService.update(id, updateCouponDto, storeId);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  remove(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.couponsService.remove(id, storeId);
  }
}
