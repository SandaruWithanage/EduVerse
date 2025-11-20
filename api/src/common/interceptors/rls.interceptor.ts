import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class RlsInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    const user = req.user as
      | { sub: string; tenantId: string | null; role: string }
      | undefined;

    // Default values for unauthenticated requests
    let tenantId = '';
    let role = 'ANONYMOUS';

    if (user) {
      role = user.role;

      // SUPER_ADMIN bypass: we keep tenantId = '' (empty string)
      if (user.role !== 'SUPER_ADMIN' && user.tenantId) {
        tenantId = user.tenantId;
      }
    }

    // Set Postgres session settings for this request/connection
    await this.prisma.$executeRawUnsafe(
      `SELECT set_config('app.tenant_id', $1, true)`,
      tenantId,
    );
    await this.prisma.$executeRawUnsafe(
      `SELECT set_config('app.role', $1, true)`,
      role,
    );

    return next.handle();
  }
}
