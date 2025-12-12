import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createStudentDto: CreateStudentDto) {
    return this.prisma.client.studentProfile.create({
      data: createStudentDto,
    });
  }

  findAll() {
    return this.prisma.client.studentProfile.findMany();
  }

  findOne(id: string) {
    return this.prisma.client.studentProfile.findUnique({ where: { id } });
  }

  update(id: string, updateStudentDto: UpdateStudentDto) {
    return this.prisma.client.studentProfile.update({
      where: { id },
      data: updateStudentDto,
    });
  }

  remove(id: string) {
    return this.prisma.client.studentProfile.delete({ where: { id } });
  }
}
