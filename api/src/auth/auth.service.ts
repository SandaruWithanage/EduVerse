import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { PasswordService } from './password.service';
import { ActivateAccountDto } from './activate-account.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}

  // ============================================================
  // ACCOUNT ACTIVATION (INVITE FLOW)
  // ============================================================
  async activateAccount(dto: ActivateAccountDto) {
    const { token, password } = dto;

    const invite = await this.prisma.inviteToken.findFirst({
      where: {
        token,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!invite) {
      throw new BadRequestException('Invalid or expired invite token');
    }

    const passwordHash = await this.passwordService.hash(password);

    await this.prisma.user.update({
      where: { id: invite.userId },
      data: {
        passwordHash,
        isActive: true,
        invitePending: false,
      },
    });

    await this.prisma.inviteToken.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });

    return { message: 'Account activated successfully' };
  }

  // ============================================================
  // VALIDATE USER (LOGIN BOOTSTRAP)
  // ============================================================
  async validateUser(
    email: string,
    password: string,
    ip: string,
    userAgent: string,
  ) {
    const user = await this.prisma.runUnscoped((client) =>
      client.user.findFirst({ where: { email } }),
    );

    let isValid = !!user;
    if (user) {
      isValid = await bcrypt.compare(password, user.passwordHash);
    }

    if (!isValid) {
      await this.audit.log({
        action: 'LOGIN_FAILED',
        tenantId: user?.tenantId ?? undefined,
        ip,
        userAgent,
        details: { email },
      });
      return null;
    }

    return user;
  }

  // ============================================================
  // JWT PAYLOAD BUILDER
  // ============================================================
  private buildPayload(user: {
    id: string;
    tenantId: string | null;
    role: string;
  }) {
    return { sub: user.id, tenantId: user.tenantId, role: user.role };
  }

  // ============================================================
  // LOGIN
  // ============================================================
  async loginValidatedUser(
    user: { id: string; email: string; tenantId: string | null; role: string },
    ip: string,
    userAgent: string,
  ) {
    const payload = this.buildPayload(user);

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '7d'),
    });

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const tokenHash = await bcrypt.hash(refreshToken, saltRounds);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.runWithContext(
      { userId: user.id, role: user.role, tenantId: user.tenantId },
      () =>
        this.prisma.client.refreshToken.create({
          data: { userId: user.id, tokenHash, expiresAt },
        }),
    );

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
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId: string = decoded.sub;
    const tenantId: string | null = decoded.tenantId ?? null;
    const role: string = decoded.role;

    return this.prisma.runWithContext({ userId, role, tenantId }, async () => {
      const tokens = await this.prisma.client.refreshToken.findMany({
        where: { userId },
      });

      let validRecord: { id: string; tokenHash: string } | null = null;

      for (const record of tokens) {
        const match = await bcrypt.compare(refreshToken, record.tokenHash);
        if (match) {
          validRecord = record;
          break;
        }
      }

      if (!validRecord) {
        throw new UnauthorizedException('Refresh token invalid');
      }

      await this.prisma.client.refreshToken.delete({
        where: { id: validRecord.id },
      });

      const payload = { sub: userId, tenantId, role };

      const newAccessToken = await this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
      });

      const newRefreshToken = await this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '7d'),
      });

      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const tokenHash = await bcrypt.hash(newRefreshToken, saltRounds);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.prisma.client.refreshToken.create({
        data: { userId, tokenHash, expiresAt },
      });

      await this.audit.log({
        action: 'REFRESH_TOKEN_USED',
        tenantId: tenantId ?? undefined,
        userId,
        details: { rotatedFromId: validRecord.id },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    });
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
      return { message: 'Logged out' };
    }

    const userId: string = decoded.sub;
    const tenantId: string | null = decoded.tenantId ?? null;
    const role: string = decoded.role;

    await this.prisma.runWithContext({ userId, role, tenantId }, async () => {
      await this.prisma.client.refreshToken.deleteMany({
        where: { userId },
      });
    });

    await this.audit.log({
      action: 'LOGOUT',
      tenantId: tenantId ?? undefined,
      userId,
    });

    return { message: 'Logged out' };
  }
}
