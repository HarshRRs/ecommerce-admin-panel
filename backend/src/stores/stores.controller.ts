import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) { }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  create(
    @Body() createStoreDto: CreateStoreDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.storesService.create(createStoreDto, userId);
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.storesService.findAll(userId, userRole);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.storesService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.storesService.update(id, updateStoreDto, userId, userRole);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') userRole: Role) {
    return this.storesService.remove(id, userId, userRole);
  }

  @Patch(':id/suspend')
  @Roles(Role.SUPER_ADMIN)
  suspend(@Param('id') id: string) {
    return this.storesService.updateStatus(id, 'SUSPENDED');
  }

  @Patch(':id/activate')
  @Roles(Role.SUPER_ADMIN)
  activate(@Param('id') id: string) {
    return this.storesService.updateStatus(id, 'ACTIVE');
  }

  @Post(':id/confirm-stripe')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  confirmStripe(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.storesService.confirmStripeOwnership(id, userId, userRole);
  }
}
