import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../../system/audit-logs/audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, ip, headers } = request;

    // Only log mutations (POST, PATCH, PUT, DELETE)
    const isMutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
    if (!isMutation) {
      return next.handle();
    }

    // Skip sensitive paths like login
    const isSensitive =
      url.includes('login') || url.includes('register') || url.includes('password');
    if (isSensitive) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async () => {
        if (!user) return;

        const action = `${method}_${this.getResourceFromUrl(url)}`;
        const resource = this.getResourceFromUrl(url);

        await this.auditLogService.log({
          userId: user.id,
          storeId: user.storeId,
          action: action.toUpperCase(),
          resource: resource,
          resourceId: body?.id || request.params?.id,
          changes: body, // Simplified: log the request body as changes
          ipAddress: ip,
          userAgent: headers['user-agent'],
        });
      }),
    );
  }

  private getResourceFromUrl(url: string): string {
    const parts = url.split('/').filter((p) => p && p !== 'api' && p !== 'v1');
    return parts[0] || 'system';
  }
}
