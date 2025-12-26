import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/services/cache.service';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  @Public()
  @Get()
  async check() {
    const checks = await this.performHealthChecks();
    const isHealthy = Object.values(checks).every((check: any) => check.status === 'up');

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  @Public()
  @Get('ready')
  async ready() {
    // Check if application is ready to serve requests
    try {
      await this.prisma.user.findFirst({ select: { id: true } });
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Public()
  @Get('live')
  async live() {
    // Simple liveness check - application is running
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  private async performHealthChecks() {
    const checks: any = {
      database: await this.checkDatabase(),
      cache: await this.checkCache(),
    };

    return checks;
  }

  private async checkDatabase() {
    try {
      // Use findFirst instead of $queryRaw for better compatibility
      await this.prisma.user.findFirst({ select: { id: true } });
      return {
        status: 'up',
        message: 'Database connection successful',
      };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Database connection failed',
      };
    }
  }

  private async checkCache() {
    try {
      const testKey = 'health:check';
      await this.cache.set(testKey, 'ok', 10);
      const value = await this.cache.get(testKey);
      await this.cache.del(testKey);

      return {
        status: value === 'ok' ? 'up' : 'degraded',
        message: value === 'ok' ? 'Cache operational' : 'Cache not configured',
      };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Cache check failed',
      };
    }
  }
}
