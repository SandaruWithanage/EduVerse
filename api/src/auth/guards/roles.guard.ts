// src/auth/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1) Get required roles from @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles decorator → allow everyone who passed JwtAuthGuard
    if (!requiredRoles) return true;

    // 2) Get user injected by JwtStrategy.validate()
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 3) If no user → JwtAuthGuard didn't run → deny
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // 4) Check allowed roles
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied: insufficient role');
    }

    return true;
  }
}
