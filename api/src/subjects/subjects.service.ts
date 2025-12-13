import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { tenantWhere } from 'src/common/tenant-where';

@Injectable()
export class SubjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  async create(dto: CreateSubjectDto) {
  const tenantId = this.cls.get('tenantId');
  const role = this.cls.get('userRole');

  if (role !== 'SUPER_ADMIN' && !tenantId) {
    throw new ForbiddenException();
  }

  return this.prisma.client.subject.create({
    data: {
      ...(dto as any),
      tenantId,
    },
  });
}

  async findAll() {
    return this.prisma.client.subject.findMany({
      where: { ...tenantWhere(this.cls) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.client.subject.findFirst({
      where: { ...tenantWhere(this.cls), id },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async update(id: string, dto: UpdateSubjectDto) {
    // 🔒 Ownership check first
    const existing = await this.prisma.client.subject.findFirst({
      where: { ...tenantWhere(this.cls), id },
    });

    if (!existing) {
      throw new NotFoundException('Subject not found');
    }

    return this.prisma.client.subject.update({
      where: { id: existing.id },
      data: dto,
    });
  }

  async remove(id: string) {
    // 🔒 Ownership check first
    const existing = await this.prisma.client.subject.findFirst({
      where: { ...tenantWhere(this.cls), id },
    });

    if (!existing) {
      throw new NotFoundException('Subject not found');
    }

    return this.prisma.client.subject.delete({
      where: { id: existing.id },
    });
  }
}
