/*
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma.service';

// 1. Teach TypeScript that 'req.prisma' exists
declare module 'express' {
  interface Request {
    prisma?: ReturnType<PrismaService['createRlsClient']>;
  }
}

@Injectable()
export class RlsInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    // 2. Extract User Info (safely handle if user is not logged in)
    const user = req.user as
      | { sub: string; tenantId: string | null; role: string }
      | undefined;

    let tenantId = '';
    let role = 'ANONYMOUS';

    if (user) {
      role = user.role;
      // Only set tenantId if not SUPER_ADMIN (who can see everything)
      if (user.role !== 'SUPER_ADMIN' && user.tenantId) {
        tenantId = user.tenantId;
      }
    }

    // 3. Attach the SAFE client to the request
    // This client will automatically add "WHERE tenant_id = ..." to queries
    req.prisma = this.prisma.createRlsClient(tenantId, role);

    return next.handle();
  }
}
*/