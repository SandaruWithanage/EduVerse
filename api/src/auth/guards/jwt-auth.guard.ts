// src/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ClsService } from 'nestjs-cls'; // 1. Import CLS

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector, // 2. Keep Reflector for @Public()
    private readonly cls: ClsService, // 3. Inject CLS for RLS context
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 4. RESTORED: Check for @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  // 5. ADDED: This runs only if authentication succeeds
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    // 🔴 CRITICAL FIX: Save Tenant ID to Context Store
    // This allows the PrismaService to pick it up later
    if (user.tenantId) {
      this.cls.set('tenantId', user.tenantId);
      this.cls.set('userRole', user.role);
    }
    
    return user;
  }
}