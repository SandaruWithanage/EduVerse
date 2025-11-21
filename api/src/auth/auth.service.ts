// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Helper: payload builder
  private buildPayload(user: { id: string; tenantId: string | null; role: string }) {
    return {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    };
  }

  // ---------------- LOGIN ----------------
  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findFirst({
      where: { email, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = this.buildPayload(user);

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    // Hash refresh token
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

  // ---------------- REFRESH TOKEN ----------------
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    // Verify JWT refresh token
    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId: string = decoded.sub;

    // Get all stored refresh tokens for this user
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId },
    });

    if (!tokens.length) {
      throw new UnauthorizedException('Token not found or already used');
    }

    // Compare hashed values
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

    // Delete used refresh token (rotation)
    await this.prisma.refreshToken.delete({
      where: { id: validRecord.id },
    });

    // Build payload
    const payload = {
      sub: decoded.sub,
      tenantId: decoded.tenantId,
      role: decoded.role,
    };

    // New access token
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    // New refresh token
    const newRefreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    // Hash and save new refresh token
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

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
  // ---------------- LOGOUT ----------------
  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      return { message: 'Logged out' }; // safe response
    }

    const userId = decoded.sub;

    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Logged out' };
  }
}
