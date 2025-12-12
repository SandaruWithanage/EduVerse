import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createSubjectDto: CreateSubjectDto) {
    // 🔒 SAFE: Using .client
    return this.prisma.client.subject.create({
      data: createSubjectDto,
    });
  }

  findAll() {
    // 🔒 SAFE: Using .client (RLS applied)
    return this.prisma.client.subject.findMany();
  }

  findOne(id: string) {
    return this.prisma.client.subject.findUnique({ where: { id } });
  }

  update(id: string, updateSubjectDto: UpdateSubjectDto) {
    return this.prisma.client.subject.update({
      where: { id },
      data: updateSubjectDto,
    });
  }

  remove(id: string) {
    return this.prisma.client.subject.delete({ where: { id } });
  }
}
