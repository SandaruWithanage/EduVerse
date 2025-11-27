// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config'; // 1. Import

import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly audit: AuditService,
    private readonly config: ConfigService, // 2. Inject
  ) {}

  // ... inside AuthService class
  async validateUser(
    email: string,
    password: string,
    ip: string,
    userAgent: string,
  ) {
    const user = await this.prisma.user.findFirst({ where: { email } });

    // Don't return immediately, just flag it
    let isValid = !!user;

    if (user) {
      isValid = await bcrypt.compare(password, user.passwordHash);
    }

    if (!isValid) {
      // 🔒 SECURITY: Generic log message to prevent user enumeration
      await this.audit.log({
        action: 'LOGIN_FAILED', // Unified error code
        // We specifically DO NOT log userId here if user wasn't found to avoid confusion
        tenantId: user?.tenantId ?? undefined,
        ip,
        userAgent,
        details: { email }, // Log email so you know who is being targeted
      });
      return null;
    }

    return user;
  }

  // ============================================================
  // PAYLOAD BUILDER (what goes inside JWT)
  // ============================================================
  private buildPayload(user: {
    id: string;
    tenantId: string | null;
    role: string;
  }) {
    return {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    };
  }

  // ============================================================
  // LOGIN (Called AFTER validateUser() in controller)
  // ============================================================
  async loginValidatedUser(
    user: {
      id: string;
      email: string;
      tenantId: string | null;
      role: string;
    },
    ip: string,
    userAgent: string,
  ) {
    const payload = this.buildPayload(user);

    // Access token
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
    });

    // Refresh token
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '7d'),
    });

    // Store hashed refresh token (rotation-ready)
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const tokenHash = await bcrypt.hash(refreshToken, saltRounds);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // 📝 AUDIT LOG — LOGIN SUCCESS
    await this.audit.log({
      action: 'LOGIN_SUCCESS',
      tenantId: user.tenantId ?? undefined,
      userId: user.id,
      ip,
      userAgent,
      details: { email: user.email, role: user.role },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  // ============================================================
  // REFRESH TOKEN
  // ============================================================
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      // optional: you could audit here as REFRESH_TOKEN_INVALID_SIGNATURE
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId: string = decoded.sub;

    // 2) Find stored refresh tokens for this user
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId },
    });

    if (!tokens.length) {
      throw new UnauthorizedException('Token not found or already used');
    }

    // 3) Match against hashed values
    let validRecord: { id: string; tokenHash: string } | null = null;

    for (const record of tokens) {
      const match = await bcrypt.compare(refreshToken, record.tokenHash);
      if (match) {
        validRecord = record;
        break;
      }
    }

    if (!validRecord) {
      // optional: audit REFRESH_TOKEN_REJECTED
      throw new UnauthorizedException('Refresh token invalid');
    }

    // 4) Delete used token (rotation)
    await this.prisma.refreshToken.delete({
      where: { id: validRecord.id },
    });

    const payload = {
      sub: decoded.sub,
      tenantId: decoded.tenantId,
      role: decoded.role,
    };

    // 5) Issue new access token
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
    });

    // 6) Issue new refresh token
    const newRefreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '7d'),
    });

    // 7) Store new hashed refresh token
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const tokenHash = await bcrypt.hash(newRefreshToken, saltRounds);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    // 📝 AUDIT LOG — REFRESH TOKEN USED
    await this.audit.log({
      action: 'REFRESH_TOKEN_USED',
      tenantId: decoded.tenantId ?? undefined,
      userId,
      details: { rotatedFromId: validRecord.id },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  // ============================================================
  // LOGOUT
  // ============================================================
  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      // Even if token is invalid/expired, treat as logged out
      return { message: 'Logged out' };
    }

    const userId = decoded.sub;

    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // 📝 AUDIT LOG — LOGOUT
    await this.audit.log({
      action: 'LOGOUT',
      tenantId: decoded.tenantId ?? undefined,
      userId,
    });

    return { message: 'Logged out' };
  }
}
