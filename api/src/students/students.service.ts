import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../prisma.service';
import { ClsService } from 'nestjs-cls';
import { tenantWhere } from 'src/common/tenant-where';



@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

 async create(dto: CreateStudentDto) {
  const tenantId = this.cls.get('tenantId');
  const role = this.cls.get('userRole');
  if (role !== 'SUPER_ADMIN' && !tenantId) throw new ForbiddenException();

  return this.prisma.client.studentProfile.create({
    data: {
      ...dto,
      tenantId,
    },
  });
}

  async findAll() {
  return this.prisma.client.studentProfile.findMany({
    where: { ...tenantWhere(this.cls) },
    orderBy: { createdAt: 'desc' },
  });
}

  async findOne(id: string) {
  const student = await this.prisma.client.studentProfile.findFirst({
    where: { ...tenantWhere(this.cls), id },
  });

  if (!student) throw new NotFoundException('Student not found');
  return student;
}

async update(id: string, dto: UpdateStudentDto) {
  // first ensure record belongs to tenant
  const existing = await this.prisma.client.studentProfile.findFirst({
    where: { ...tenantWhere(this.cls), id },
  });
  if (!existing) throw new NotFoundException('Student not found');

  return this.prisma.client.studentProfile.update({
    where: { id: existing.id }, // safe now because we already checked tenant
    data: dto,
  });
}

 async remove(id: string) {
  const existing = await this.prisma.client.studentProfile.findFirst({
    where: { ...tenantWhere(this.cls), id },
  });
  if (!existing) throw new NotFoundException('Student not found');

  return this.prisma.client.studentProfile.delete({
    where: { id: existing.id },
  });
}

}
