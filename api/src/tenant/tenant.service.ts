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
  // CREATE TENANT
  // ============================================================
  async create(dto: CreateTenantDto, user: any, ip: string, agent: string) {
    // 1. Hash the password first
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(dto.adminPassword, saltRounds);

    // 2. Run inside a Transaction
    // 🔒 SAFE: Use .client.$transaction to ensure extension context is preserved/handled correctly
    const result = await this.prisma.client.$transaction(async (tx) => {
      // Step A: Create the Tenant
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

      // Step B: Create the School Admin User linked to this Tenant
      const adminUser = await tx.user.create({
        data: {
          email: dto.adminEmail,
          passwordHash: hashedPassword,
          role: UserRole.SCHOOL_ADMIN, // Force this role
          tenantId: tenant.id,         // Link to the new school
          isActive: true,
        },
      });

      return { tenant, adminUser };
    });

    // 3. Audit Log (Outside transaction to avoid locking audit table unnecessarily)
    await this.audit.log({
      action: 'TENANT_CREATED_WITH_ADMIN',
      tenantId: result.tenant.id,
      userId: user.id, // The Super Admin who performed this action
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
  // GET ALL TENANTS
  // ============================================================
  async findAll() {
    // 🔒 SAFE: .client
    return this.prisma.client.tenant.findMany();
  }

  // ============================================================
  // GET ONE TENANT
  // ============================================================
  async findOne(id: string, user: any, ip: string, agent: string) {
    // 🔒 SAFE: .client
    const tenant = await this.prisma.client.tenant.findUnique({ where: { id } });

    if (!tenant) throw new NotFoundException('Tenant not found');

    await this.audit.log({
      action: 'TENANT_VIEWED',
      tenantId: id,
      userId: user.id,
      ip,
      userAgent: agent,
    });

    return tenant;
  }

  // ============================================================
  // UPDATE TENANT
  // ============================================================
  async update(
    id: string,
    dto: UpdateTenantDto,
    user: any,
    ip: string,
    agent: string,
  ) {
    // 🔒 SAFE: .client
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