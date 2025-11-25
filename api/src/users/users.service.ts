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

    // Must be SCHOOL_ADMIN to manage users
    if (currentUser.role !== UserRole.SCHOOL_ADMIN) {
      throw new BadRequestException('You are not allowed to manage users');
    }

    // Tenant restriction: Cannot manage users from other schools
    if (targetUser.tenantId !== currentUser.tenantId) {
      throw new BadRequestException('You can only manage users in your tenant');
    }

    // Role hierarchy restriction: School Admin cannot modify other Admins or Supers
    const forbiddenRoles = [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN];
    // Logic: If target is an Admin/Super, deny access
    if (forbiddenRoles.includes(targetUser.role)) {
       // Exception: Users can usually edit themselves, but here we are talking about management actions
       if (currentUser.id !== targetUser.id) {
         throw new BadRequestException('You cannot manage other admins or super admins');
       }
    }
  }

  // ---------- CREATE USER ----------
  async create(dto: CreateUserDto, currentUser: any, ip: string, agent: string) {
    // School admin cannot create SUPER_ADMIN or SCHOOL_ADMIN (only teacher/parent/clerk)
    const allowedBySchoolAdmin: string[] = [
      UserRole.TEACHER,
      UserRole.PARENT,
      UserRole.CLERK,
    ];

    // Determine tenantId for new user
    let tenantId: string | null = null;

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // Super admin can create any role, but must provide tenantId (unless creating another Super Admin)
      if (dto.role !== UserRole.SUPER_ADMIN && !dto.tenantId) {
         // Optional: Enforce tenantId for non-super users
         // throw new BadRequestException('tenantId is required');
      }
      tenantId = dto.tenantId ?? null; // Allow null for Super Admin users
    } else if (currentUser.role === UserRole.SCHOOL_ADMIN) {
      // School admin checks
      if (!allowedBySchoolAdmin.includes(dto.role)) {
        throw new BadRequestException(
          'School admins can only create TEACHER, PARENT, or CLERK users',
        );
      }

      if (!currentUser.tenantId) {
        throw new BadRequestException('Your user is not attached to a tenant');
      }

      // Force tenant to their own
      tenantId = currentUser.tenantId;
    } else {
      throw new BadRequestException('You are not allowed to create users');
    }

    // Hash password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        tenantId,
      },
    });

    // Audit
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

    // Hide passwordHash in response
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
      // See all users
      return this.prisma.user.findMany({
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

    // Per-tenant list for School Admin
    return this.prisma.user.findMany({
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

  // ---------- GET ONE USER ----------
  async findOne(id: string, currentUser: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Only restrict access for non-super
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      if (!currentUser.tenantId || user.tenantId !== currentUser.tenantId) {
        throw new BadRequestException('You cannot view this user (Different Tenant)');
      }
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
    };
  }

  // ---------- UPDATE USER ----------
  async update(
    id: string,
    dto: UpdateUserDto,
    currentUser: any,
    ip: string,
    agent: string,
  ) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    // Enforce permissions
    this.assertCanManageTarget(currentUser, existing);

    // School admin cannot promote roles above allowed set
    if (dto.role && currentUser.role === UserRole.SCHOOL_ADMIN) {
      const allowedBySchoolAdmin: string[] = [
        UserRole.TEACHER,
        UserRole.PARENT,
        UserRole.CLERK,
      ];
      if (!allowedBySchoolAdmin.includes(dto.role)) {
        throw new BadRequestException(
          'You cannot assign this role as School Admin',
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
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

  // ---------- RESET PASSWORD ----------
  async resetPassword(
    id: string,
    dto: ResetPasswordDto,
    currentUser: any,
    ip: string,
    agent: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Enforce permissions
    this.assertCanManageTarget(currentUser, user);

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    // Revoke refresh tokens to force re-login
    await this.prisma.refreshToken.deleteMany({
      where: { userId: id },
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