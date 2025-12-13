import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ---------- Helper: enforce who can manage whom ----------
  private assertCanManageTarget(currentUser: any, targetUser: any) {
    // SUPER_ADMIN can manage anyone
    if (currentUser.role === UserRole.SUPER_ADMIN) return;

    // Non-super must have tenant
    if (!currentUser.tenantId) {
      throw new BadRequestException('You are not bound to a tenant');
    }

    // Must be SCHOOL_ADMIN
    if (currentUser.role !== UserRole.SCHOOL_ADMIN) {
      throw new BadRequestException('You are not allowed to manage users');
    }

    // Tenant isolation
    if (targetUser.tenantId !== currentUser.tenantId) {
      throw new BadRequestException('You can only manage users in your tenant');
    }

    // Role hierarchy restriction
    const forbiddenRoles = [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN];
    if (forbiddenRoles.includes(targetUser.role)) {
      if (currentUser.id !== targetUser.id) {
        throw new BadRequestException(
          'You cannot manage other admins or super admins',
        );
      }
    }
  }

  // ---------- CREATE USER ----------
  async create(
    dto: CreateUserDto,
    currentUser: any,
    ip: string,
    agent: string,
  ) {
    let tenantId: string | null = null;

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // SUPER_ADMIN: tenantId optional (null for super users)
      tenantId = dto.role === UserRole.SUPER_ADMIN ? null : dto.tenantId ?? null;
    } else if (currentUser.role === UserRole.SCHOOL_ADMIN) {
      const allowed: UserRole[] = [
        UserRole.TEACHER,
        UserRole.PARENT,
        UserRole.CLERK,
      ];

      if (!allowed.includes(dto.role)) {
        throw new BadRequestException(
          'School admins can only create TEACHER, PARENT, or CLERK users',
        );
      }

      if (!currentUser.tenantId) {
        throw new BadRequestException('Your user is not attached to a tenant');
      }

      tenantId = currentUser.tenantId;
    } else {
      throw new BadRequestException('You are not allowed to create users');
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.client.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        tenantId,
      },
    });

    await this.audit.log({
      action: 'USER_CREATED',
      tenantId: tenantId ?? undefined,
      userId: currentUser.id,
      ip,
      userAgent: agent,
      details: {
        createdUserId: user.id,
        createdRole: user.role,
        createdEmail: user.email,
      },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
    };
  }

  // ---------- LIST USERS ----------
  async findAll(currentUser: any) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return this.prisma.client.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          tenantId: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!currentUser.tenantId) {
      throw new BadRequestException('Your user is not attached to a tenant');
    }

    return this.prisma.client.user.findMany({
      where: { tenantId: currentUser.tenantId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------- GET ONE USER (HARDENED) ----------
  async findOne(id: string, currentUser: any) {
    const user = await this.prisma.client.user.findFirst({
      where: {
        id,
        ...(currentUser.role !== UserRole.SUPER_ADMIN
          ? { tenantId: currentUser.tenantId }
          : {}),
      },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        isActive: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ---------- UPDATE USER (HARDENED) ----------
  async update(
    id: string,
    dto: UpdateUserDto,
    currentUser: any,
    ip: string,
    agent: string,
  ) {
    const existing = await this.prisma.client.user.findFirst({
      where: {
        id,
        ...(currentUser.role !== UserRole.SUPER_ADMIN
          ? { tenantId: currentUser.tenantId }
          : {}),
      },
    });

    if (!existing) throw new NotFoundException('User not found');

    this.assertCanManageTarget(currentUser, existing);

    if (dto.role && currentUser.role === UserRole.SCHOOL_ADMIN) {
      const allowed: UserRole[] = [
        UserRole.TEACHER,
        UserRole.PARENT,
        UserRole.CLERK,
      ];
      if (!allowed.includes(dto.role)) {
        throw new BadRequestException(
          'You cannot assign this role as School Admin',
        );
      }
    }

    const updated = await this.prisma.client.user.update({
      where: { id: existing.id },
      data: {
        email: dto.email ?? undefined,
        role: dto.role ?? undefined,
        isActive: dto.isActive ?? undefined,
      },
    });

    await this.audit.log({
      action: 'USER_UPDATED',
      tenantId: updated.tenantId ?? undefined,
      userId: currentUser.id,
      ip,
      userAgent: agent,
      details: {
        targetUserId: updated.id,
        changes: dto,
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      role: updated.role,
      tenantId: updated.tenantId,
      isActive: updated.isActive,
    };
  }

  // ---------- RESET PASSWORD (HARDENED) ----------
  async resetPassword(
    id: string,
    dto: ResetPasswordDto,
    currentUser: any,
    ip: string,
    agent: string,
  ) {
    const user = await this.prisma.client.user.findFirst({
      where: {
        id,
        ...(currentUser.role !== UserRole.SUPER_ADMIN
          ? { tenantId: currentUser.tenantId }
          : {}),
      },
    });

    if (!user) throw new NotFoundException('User not found');

    this.assertCanManageTarget(currentUser, user);

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.prisma.client.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await this.prisma.client.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    await this.audit.log({
      action: 'USER_PASSWORD_RESET',
      tenantId: user.tenantId ?? undefined,
      userId: currentUser.id,
      ip,
      userAgent: agent,
      details: {
        targetUserId: user.id,
      },
    });

    return { message: 'Password reset successfully' };
  }
}
