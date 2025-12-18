import { Controller, Get, Query, Param } from '@nestjs/common';
import { SystemService } from './system.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) { }

  @Get('audit-logs')
  @Roles(Role.SUPER_ADMIN, Role.OWNER, Role.MANAGER)
  getAuditLogs(
    @CurrentUser('storeId') storeId: string,
    @CurrentUser('role') role: Role,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    // SUPER_ADMIN can see all logs, others only their store
    const filterStoreId = role === 'SUPER_ADMIN' ? undefined : storeId;

    return this.systemService.getAuditLogs(filterStoreId, {
      userId,
      action,
      resource,
      startDate,
      endDate,
      limit: limit ? parseInt(limit, 10) : 100,
    });
  }

  @Get('stats')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  getSystemStats(
    @CurrentUser('storeId') storeId: string,
    @CurrentUser('role') role: Role,
  ) {
    // SUPER_ADMIN sees global stats, OWNER sees store stats
    const filterStoreId = role === 'SUPER_ADMIN' ? undefined : storeId;
    return this.systemService.getSystemStats(filterStoreId);
  }

  @Get('user-activity/:userId')
  @Roles(Role.SUPER_ADMIN, Role.OWNER, Role.MANAGER)
  getUserActivity(
    @Param('userId') userId: string,
    @CurrentUser('storeId') storeId: string,
    @CurrentUser('role') role: Role,
  ) {
    const filterStoreId = role === 'SUPER_ADMIN' ? undefined : storeId;
    return this.systemService.getUserActivity(userId, filterStoreId);
  }

  @Get('health')
  @Public()
  getSystemHealth() {
    return this.systemService.getSystemHealth();
  }
}
