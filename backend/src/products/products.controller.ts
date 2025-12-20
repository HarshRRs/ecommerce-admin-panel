import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, CreateVariantDto } from './dto/product.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER)
  create(@Body() createProductDto: CreateProductDto, @CurrentUser('storeId') storeId: string) {
    return this.productsService.create(createProductDto, storeId);
  }

  @Get()
  findAll(
    @CurrentUser('storeId') storeId: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll(storeId, { status, categoryId, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.productsService.findOne(id, storeId);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.productsService.update(id, updateProductDto, storeId);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  remove(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.productsService.remove(id, storeId);
  }

  @Post(':id/variants')
  @Roles(Role.OWNER, Role.MANAGER)
  createVariant(
    @Param('id') productId: string,
    @Body() createVariantDto: CreateVariantDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.productsService.createVariant(productId, createVariantDto, storeId);
  }

  @Patch(':id/stock')
  @Roles(Role.OWNER, Role.MANAGER)
  updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.productsService.updateStock(id, quantity, storeId);
  }

  @Post(':id/stock/adjust')
  @Roles(Role.OWNER, Role.MANAGER)
  adjustStock(
    @Param('id') id: string,
    @Body('adjustment') adjustment: number,
    @Body('reason') reason: string,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.productsService.adjustStock(id, adjustment, storeId, reason);
  }

  @Patch('variants/:variantId/stock')
  @Roles(Role.OWNER, Role.MANAGER)
  updateVariantStock(
    @Param('variantId') variantId: string,
    @Body('quantity') quantity: number,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.productsService.updateVariantStock(variantId, quantity, storeId);
  }

  @Get('low-stock/alert')
  getLowStockProducts(@CurrentUser('storeId') storeId: string) {
    return this.productsService.getLowStockProducts(storeId);
  }
}
