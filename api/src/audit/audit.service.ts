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
    try {
      await this.prisma.auditLog.create({
        data: {
          actionCode: data.action,
          tenantId: data.tenantId || null,
          userId: data.userId || null,
          ipAddress: data.ip || 'UNKNOWN',
          userAgent: data.userAgent || 'UNKNOWN',
          detailsJson: data.details ? JSON.stringify(data.details) : null,
          retentionUntil: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
        },
      });

      console.log(`[AUDIT] Logged: ${data.action}`);
    } catch (err) {
      console.error('[AUDIT ERROR]', err);
      // NEVER throw. Audit must not break main process.
    }
  }
}
