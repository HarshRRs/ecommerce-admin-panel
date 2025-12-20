import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CreateAddressDto } from './dto/customer.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  create(@Body() createCustomerDto: CreateCustomerDto, @CurrentUser('storeId') storeId: string) {
    return this.customersService.create(createCustomerDto, storeId);
  }

  @Get()
  findAll(@CurrentUser('storeId') storeId: string, @Query('search') search?: string) {
    return this.customersService.findAll(storeId, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.customersService.findOne(id, storeId);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.customersService.update(id, updateCustomerDto, storeId);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  remove(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.customersService.remove(id, storeId);
  }

  @Post(':id/addresses')
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  addAddress(
    @Param('id') customerId: string,
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.customersService.addAddress(customerId, createAddressDto, storeId);
  }
}
