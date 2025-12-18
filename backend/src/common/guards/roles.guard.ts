import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Role hierarchy: SUPER_ADMIN > OWNER > MANAGER > STAFF
  private roleHierarchy = {
    SUPER_ADMIN: 4,
    OWNER: 3,
    MANAGER: 2,
    STAFF: 1,
  };

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
      return false;
    }

    // SUPER_ADMIN has access to everything
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Check if user's role meets or exceeds any of the required roles
    const userRoleLevel = this.roleHierarchy[user.role] || 0;
    const hasPermission = requiredRoles.some(
      (role) => userRoleLevel >= (this.roleHierarchy[role] || 0),
    );

    return hasPermission;
  }
}
