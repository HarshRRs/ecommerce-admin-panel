import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StoreSuspensionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 1. Allow public routes (like login/auth) if they don't have a user
    if (!user) return true;

    // 2. SUPER_ADMIN bypasses suspension
    if (user.role === 'SUPER_ADMIN') return true;

    // 3. Allow specific routes (logout, profile, etc.)
    // We can define a metadata key 'isPublicAuth' or similar if needed
    const isPublicAuth = this.reflector.get<boolean>('isPublicAuth', context.getHandler());
    if (isPublicAuth) return true;

    // 4. Check store status
    if (user.storeId) {
      const store = await this.prisma.prisma.store.findUnique({
        where: { id: user.storeId },
        select: { status: true },
      });

      if (store && store.status === 'SUSPENDED') {
        throw new ForbiddenException({
          message: 'Your store is temporarily suspended. Contact support.',
          code: 'STORE_SUSPENDED',
        });
      }
    }

    return true;
  }
}
