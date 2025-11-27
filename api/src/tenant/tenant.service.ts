import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

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
    const tenant = await this.prisma.tenant.create({
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

    await this.audit.log({
      action: 'TENANT_CREATED',
      tenantId: tenant.id,
      userId: user.id,
      ip,
      userAgent: agent,
      details: {
        name: tenant.name,
        schoolCode: tenant.schoolCode,
      },
    });

    return tenant;
  }

  // ============================================================
  // GET ALL TENANTS
  // ============================================================
  async findAll() {
    return this.prisma.tenant.findMany();
  }

  // ============================================================
  // GET ONE TENANT
  // ============================================================
  async findOne(id: string, user: any, ip: string, agent: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });

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
    const tenant = await this.prisma.tenant.update({
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
