import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class TenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ============================================================
  // CREATE TENANT (SUPER_ADMIN)
  // ============================================================
  async create(
    dto: CreateTenantDto,
    user: any,
    ip: string,
    agent: string,
  ) {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(dto.adminPassword, saltRounds);

    // 🔒 Transaction: tenant + school admin must be atomic
    const result = await this.prisma.client.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          schoolCode: dto.schoolCode,
          schoolType: dto.schoolType,

          province: dto.province ?? null,
          district: dto.district,
          zone: dto.zone,
          division: dto.division,

          mediums: dto.mediums,

          addressLine1: dto.addressLine1 ?? null,
          addressLine2: dto.addressLine2 ?? null,
          city: dto.city ?? null,
          latitude: dto.latitude ?? null,
          longitude: dto.longitude ?? null,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          email: dto.adminEmail,
          passwordHash: hashedPassword,
          role: UserRole.SCHOOL_ADMIN,
          tenantId: tenant.id,
          isActive: true,
        },
      });

      return { tenant, adminUser };
    });

    // 🔍 Audit outside transaction
    await this.audit.log({
      action: 'TENANT_CREATED_WITH_ADMIN',
      tenantId: result.tenant.id,
      userId: user.id,
      ip,
      userAgent: agent,
      details: {
        schoolName: result.tenant.name,
        adminEmail: result.adminUser.email,
      },
    });

    return result.tenant;
  }

  // ============================================================
  // GET ALL TENANTS (SUPER_ADMIN)
  // ============================================================
  async findAll() {
    return this.prisma.client.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================================
  // GET ONE TENANT (SUPER_ADMIN)
  // ============================================================
  async findOne(id: string) {
    const tenant = await this.prisma.client.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  // ============================================================
  // UPDATE TENANT (FUTURE USE)
  // ============================================================
  async update(
    id: string,
    dto: UpdateTenantDto,
    user: any,
    ip: string,
    agent: string,
  ) 
  {
    const tenant = await this.prisma.client.tenant.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        schoolCode: dto.schoolCode ?? undefined,
        schoolType: dto.schoolType ?? undefined,

        province: dto.province ?? undefined,
        district: dto.district ?? undefined,
        zone: dto.zone ?? undefined,
        division: dto.division ?? undefined,

        mediums: dto.mediums ?? undefined,

        addressLine1: dto.addressLine1 ?? undefined,
        addressLine2: dto.addressLine2 ?? undefined,
        city: dto.city ?? undefined,
        latitude: dto.latitude ?? undefined,
        longitude: dto.longitude ?? undefined,
      },
    });

    await this.audit.log({
      action: 'TENANT_UPDATED',
      tenantId: id,
      userId: user.id,
      ip,
      userAgent: agent,
      details: dto,
    });

    return tenant;
  }
}
