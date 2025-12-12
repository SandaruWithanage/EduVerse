import { Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTeacherDto: CreateTeacherDto) {
    return this.prisma.client.teacherProfile.create({
      data: createTeacherDto,
    });
  }

  findAll() {
    return this.prisma.client.teacherProfile.findMany();
  }

  findOne(id: string) {
    return this.prisma.client.teacherProfile.findUnique({ where: { id } });
  }

  update(id: string, updateTeacherDto: UpdateTeacherDto) {
    return this.prisma.client.teacherProfile.update({
      where: { id },
      data: updateTeacherDto,
    });
  }

  remove(id: string) {
    return this.prisma.client.teacherProfile.delete({ where: { id } });
  }
}
