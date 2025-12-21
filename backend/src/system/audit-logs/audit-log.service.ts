import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogService {
    constructor(private prisma: PrismaService) { }

    async log(data: {
        userId: string;
        storeId?: string;
        action: string;
        resource: string;
        resourceId?: string;
        changes?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        return this.prisma.auditLog.create({
            data: {
                userId: data.userId,
                storeId: data.storeId,
                action: data.action,
                resource: data.resource,
                resourceId: data.resourceId,
                changes: data.changes,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    }
}
