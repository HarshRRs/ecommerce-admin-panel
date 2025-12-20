import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER)
  create(@Body() createDto: any, @CurrentUser('storeId') storeId: string) {
    return this.categoriesService.create(createDto, storeId);
  }

  @Get()
  findAll(@CurrentUser('storeId') storeId: string) {
    return this.categoriesService.findAll(storeId);
  }

  @Get('tree')
  getCategoryTree(@CurrentUser('storeId') storeId: string) {
    return this.categoriesService.getCategoryTree(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.categoriesService.findOne(id, storeId);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  update(@Param('id') id: string, @Body() updateDto: any, @CurrentUser('storeId') storeId: string) {
    return this.categoriesService.update(id, updateDto, storeId);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  remove(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.categoriesService.remove(id, storeId);
  }
}
