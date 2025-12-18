import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(Role.OWNER, Role.MANAGER)
  getDashboardStats(@CurrentUser('storeId') storeId: string) {
    return this.analyticsService.getDashboardStats(storeId);
  }

  @Get('sales')
  @Roles(Role.OWNER, Role.MANAGER)
  getSalesReport(
    @CurrentUser('storeId') storeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getSalesReport(storeId, start, end);
  }

  @Get('products/top')
  @Roles(Role.OWNER, Role.MANAGER)
  getTopProducts(
    @CurrentUser('storeId') storeId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.analyticsService.getTopProducts(storeId, limitNum);
  }

  @Get('customers')
  @Roles(Role.OWNER, Role.MANAGER)
  getCustomerStats(@CurrentUser('storeId') storeId: string) {
    return this.analyticsService.getCustomerStats(storeId);
  }
}
