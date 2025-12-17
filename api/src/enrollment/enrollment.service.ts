import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ClsService } from 'nestjs-cls';
import { BulkEnrollDto } from './dto/bulk-enroll.dto';
import { AdmissionStatus } from '@prisma/client';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  private requireTenantOrSuperAdmin() {
    const tenantId = this.cls.get('tenantId');
    const role = this.cls.get('userRole');

    if (role !== 'SUPER_ADMIN' && !tenantId) {
      throw new ForbiddenException('Tenant context missing');
    }

    return { tenantId, role };
  }

  private async getActiveAcademicYear() {
    this.requireTenantOrSuperAdmin();

    const year = await this.prisma.client.academicYear.findFirst({
      where: { active: true },
      select: {
        id: true,
        label: true,
      },
    });

    if (!year) {
      throw new BadRequestException('No active academic year found');
    }

    return year;
  }

  // --------------------------------------------------
  // POST /enrollment/bulk
  // --------------------------------------------------
  async bulkEnroll(dto: BulkEnrollDto) {
    this.requireTenantOrSuperAdmin();

    const { id: academicYearId, label } =
      await this.getActiveAcademicYear();

    const classroom = await this.prisma.client.classroom.findUnique({
      where: { id: dto.classId },
      select: {
        id: true,
        gradeId: true,
        classCode: true,
        className: true,
      },
    });

    if (!classroom) {
      throw new NotFoundException('Class not found');
    }

    // 🔒 Concurrency rule — ONE class per year
    const conflicts = await this.prisma.client.studentGradeClass.findMany({
      where: {
        academicYearId,
        studentId: { in: dto.studentIds },
      },
      select: {
        studentId: true,
        classId: true,
      },
    });

    if (conflicts.length > 0) {
      throw new BadRequestException(
        `Enrollment conflict: ${conflicts.length} student(s) already enrolled in academic year ${label}`,
      );
    }

    // ⚠️ Capacity warning
    const currentCount = await this.prisma.client.studentGradeClass.count({
      where: {
        academicYearId,
        classId: dto.classId,
      },
    });

    const warnings: string[] = [];
    if (currentCount + dto.studentIds.length > 45) {
      warnings.push(
        `Class ${classroom.classCode} exceeds recommended capacity (45)`,
      );
    }

    // ✅ Transactional insert
    await this.prisma.client.$transaction(async (tx) => {
      await tx.studentGradeClass.createMany({
        data: dto.studentIds.map((studentId) => ({
          studentId,
          classId: dto.classId,
          gradeId: classroom.gradeId,
          academicYearId,
          admissionStatus: AdmissionStatus.NEW,
        })),
      });
    });

    return {
      enrolled: dto.studentIds.length,
      warnings,
    };
  }

  // --------------------------------------------------
  // GET /classes/:id/students
  // --------------------------------------------------
  async getClassStudents(classId: string) {
    this.requireTenantOrSuperAdmin();

    const { id: academicYearId, label } =
      await this.getActiveAcademicYear();

    const classroom = await this.prisma.client.classroom.findUnique({
      where: { id: classId },
      select: {
        id: true,
        className: true,
        classCode: true,
      },
    });

    if (!classroom) {
      throw new NotFoundException('Class not found');
    }

    const enrollments = await this.prisma.client.studentGradeClass.findMany({
      where: {
        classId,
        academicYearId,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            indexNumber: true,
            admissionNumber: true,
            gender: true,
          },
        },
      },
      orderBy: {
        student: { admissionNumber: 'asc' },
      },
    });

    return {
      class: classroom,
      academicYear: label,
      students: enrollments.map((e) => e.student),
    };
  }
}
