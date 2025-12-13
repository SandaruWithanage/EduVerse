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

  // 🔒 Only admins can create subjects
  if (!tenantId || role === 'TEACHER') {
    throw new ForbiddenException();
  }

  return this.prisma.client.subject.create({
    data: {
      ...dto,      // ✅ no "as any"
      tenantId,    // ✅ enforced from CLS
    },
  });
}


  async findAll(grade?: number) {
  return this.prisma.client.subject.findMany({
    where: {
      ...tenantWhere(this.cls),
      ...(grade ? { validGrades: { has: grade } } : {}),
    },
    orderBy: { name: 'asc' },
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
  const role = this.cls.get('userRole');
  if (role === 'TEACHER') {
    throw new ForbiddenException();
}
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
    const role = this.cls.get('userRole');
    if (role === 'TEACHER') {
      throw new ForbiddenException();
}
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
