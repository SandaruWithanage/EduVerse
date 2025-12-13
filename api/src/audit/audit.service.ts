import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface AuditLogDto {
  action: string;
  tenantId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: AuditLogDto) {
    const payload = {
      actionCode: data.action,
      tenantId: data.tenantId || null,
      userId: data.userId || null,
      ipAddress: data.ip || 'UNKNOWN',
      userAgent: data.userAgent || 'UNKNOWN',
      detailsJson: data.details ? JSON.stringify(data.details) : null,
      retentionUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      ),
    };

    const SYSTEM_ACTIONS = ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT'];
    const forceSystemWrite = SYSTEM_ACTIONS.includes(data.action);

    try {
      if (forceSystemWrite) {
        await this.prisma.runUnscoped(async (client) => {
          return client.auditLog.create({ data: payload });
        });
      } else {
        await this.prisma.client.auditLog.create({ data: payload });
      }
    } catch (err) {
      // Intentionally minimal: do not throw from audit path
      // eslint-disable-next-line no-console
      console.error(`[AUDIT ERROR] Failed to write audit log (${data.action})`, err);
    }
  }
}
