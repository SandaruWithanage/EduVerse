import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { tenantWhere } from 'src/common/tenant-where';

@Injectable()
export class TeachersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  // =====================================================
  // CREATE
  // =====================================================
  async create(dto: CreateTeacherDto) {
    const tenantId = this.cls.get('tenantId');
    const role = this.cls.get('userRole');

    // 🔒 Tenant is mandatory
    if (role !== 'SUPER_ADMIN' && !tenantId) {
      throw new ForbiddenException('Tenant context missing');
    }

    // ✅ Generate system code
    const systemCode = await this.nextTeacherSystemCode(tenantId);

    const data: Prisma.TeacherProfileUncheckedCreateInput = {
      tenantId,
      systemCode,

      fullName: dto.fullName,
      initials: dto.initials ?? null,
      nic: dto.nic,
      tin: dto.tin,
      subjectCodes: dto.subjectCodes ?? [],

      appointmentType: dto.appointmentType,
      serviceStart: new Date(dto.serviceStart),

      employmentStatus: dto.employmentStatus ?? undefined,
      dateOfBirth: new Date(dto.dateOfBirth),

      gender: dto.gender,
      motherTongue: dto.motherTongue,
      religion: dto.religion,
      ethnicity: dto.ethnicity,

      userId: dto.userId ?? undefined,
    };

    return this.prisma.client.teacherProfile.create({ data });
  }


  // =====================================================
  // READ ALL
  // =====================================================
  async findAll() {
    return this.prisma.client.teacherProfile.findMany({
      where: { ...tenantWhere(this.cls) },
      orderBy: { createdAt: 'desc' },
    });
  }

  // =====================================================
  // READ ONE
  // =====================================================
  async findOne(id: string) {
    const teacher = await this.prisma.client.teacherProfile.findFirst({
      where: { ...tenantWhere(this.cls), id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher;
  }

  // =====================================================
  // UPDATE
  // =====================================================
  async update(id: string, dto: UpdateTeacherDto) {
    // 🔒 Ownership check FIRST
    const existing = await this.prisma.client.teacherProfile.findFirst({
      where: { ...tenantWhere(this.cls), id },
    });

    if (!existing) {
      throw new NotFoundException('Teacher not found');
    }

    const data: Prisma.TeacherProfileUncheckedUpdateInput = {
      fullName: dto.fullName ?? undefined,
      initials: dto.initials ?? undefined,
      nic: dto.nic ?? undefined,
      tin: dto.tin ?? undefined,

      subjectCodes: dto.subjectCodes
        ? { set: dto.subjectCodes }
        : undefined,

      appointmentType: dto.appointmentType ?? undefined,

      serviceStart: dto.serviceStart
        ? new Date(dto.serviceStart)
        : undefined,

      employmentStatus: dto.employmentStatus ?? undefined,

      dateOfBirth: dto.dateOfBirth
        ? new Date(dto.dateOfBirth)
        : undefined,

      gender: dto.gender ?? undefined,
      motherTongue: dto.motherTongue ?? undefined,
      religion: dto.religion ?? undefined,
      ethnicity: dto.ethnicity ?? undefined,

      userId: dto.userId ?? undefined,
    };

    return this.prisma.client.teacherProfile.update({
      where: { id: existing.id }, // safe: tenant already verified
      data,
    });
  }

  // =====================================================
  // DELETE
  // =====================================================
  async remove(id: string) {
    // 🔒 Ownership check FIRST
    const existing = await this.prisma.client.teacherProfile.findFirst({
      where: { ...tenantWhere(this.cls), id },
    });

    if (!existing) {
      throw new NotFoundException('Teacher not found');
    }

    return this.prisma.client.teacherProfile.delete({
      where: { id: existing.id },
    });
  }

  private async nextTeacherSystemCode(tenantId: string) {
  const tenant = await this.prisma.client.tenant.findUnique({
    where: { id: tenantId },
    select: { schoolCode: true },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const count = await this.prisma.client.teacherProfile.count({
    where: { tenantId },
  });

  const next = count + 1;

  return `EV-${tenant.schoolCode}-TEA-${String(next).padStart(6, '0')}`;
}

}
