import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ClsService } from 'nestjs-cls';
import { tenantWhere } from 'src/common/tenant-where';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { TeacherClassRole, UserRole } from '@prisma/client';

@Injectable()
export class AllocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  async assignTeacher(dto: AssignTeacherDto) {
  const role = this.cls.get('userRole') as UserRole;

  // 🔒 Teachers can NEVER assign subjects
  if (role === UserRole.TEACHER) {
    throw new ForbiddenException();
  }

  // 1️⃣ Load classroom (derive tenant from here)
  const classroom = await this.prisma.client.classroom.findUnique({
    where: { id: dto.classId },
    include: {
      grade: true,
    },
  });

  if (!classroom) {
    throw new NotFoundException('Class not found');
  }

  const tenantId = classroom.tenantId;

  // 2️⃣ Load teacher (must belong to SAME tenant)
  const teacher = await this.prisma.client.teacherProfile.findFirst({
    where: {
      id: dto.teacherId,
      tenantId,
    },
  });

  if (!teacher) {
    throw new NotFoundException('Teacher not found in this school');
  }

  // 3️⃣ Load subject (must belong to SAME tenant)
  const subject = await this.prisma.client.subject.findFirst({
    where: {
      id: dto.subjectId,
      tenantId,
    },
  });

  if (!subject) {
    throw new NotFoundException('Subject not found in this school');
  }

  // 4️⃣ Validate subject ↔ grade compatibility
  if (!subject.validGrades.includes(classroom.grade.gradeNumber)) {
    throw new BadRequestException(
      `Subject ${subject.name} is not valid for Grade ${classroom.grade.gradeNumber}`,
    );
  }

  // 5️⃣ Prevent duplicate assignment (idempotent)
  const existing = await this.prisma.client.teacherGradeClass.findFirst({
    where: {
      teacherId: teacher.id,
      classId: classroom.id,
      academicYearId: dto.academicYearId,
      subjectId: subject.id,
    },
  });

  if (existing) {
    return existing;
  }

  // 6️⃣ Create allocation
  return this.prisma.client.teacherGradeClass.create({
    data: {
      teacherId: teacher.id,
      gradeId: classroom.grade.id,
      classId: classroom.id,
      academicYearId: dto.academicYearId,
      subjectId: subject.id,
      roleInClass: TeacherClassRole.SUBJECT_TEACHER,
    },
  });
}

  async getTeacherSchedule(teacherId: string) {
    const role = this.cls.get('userRole') as UserRole;

    // Teachers can only see their own schedule
    if (role === UserRole.TEACHER) {
      const selfId = this.cls.get('teacherProfileId');
      if (!selfId || teacherId !== selfId) {
        throw new ForbiddenException();
      }
    }

    return this.prisma.client.teacherGradeClass.findMany({
      where: {
        teacherId,
        ...tenantWhere(this.cls),
      },
      include: {
        subject: true,
        classroom: {
          include: { grade: true },
        },
        academicYear: true,
      },
      orderBy: { academicYearId: 'desc' },
    });
  }
}
