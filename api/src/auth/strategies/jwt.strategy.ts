// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Where to read the token from:
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
            secretOrKey: process.env.JWT_ACCESS_SECRET!,     });
  }

  // Whatever we return here becomes req.user
  async validate(payload: {
    sub: string;
    tenantId: string | null;
    role: string;
  }) {
    return {
      id: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
    };
  }
}
