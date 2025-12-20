import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ClsService } from 'nestjs-cls';
import { GateScanDto } from './dto/gate-scan.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  // =========================
  // SHARED HELPERS
  // =========================

  private parseDateOnly(dateStr: string) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private async getActiveAcademicYearId() {
    const ay = await this.prisma.client.academicYear.findFirst({
      where: { active: true },
      select: { id: true },
    });
    if (!ay) throw new BadRequestException('No active academic year');
    return ay.id;
  }

  // =========================
  // PHASE 6.2 — GATE ATTENDANCE
  // =========================
  async gateScan(dto: GateScanDto) {
    const tenantId = this.cls.get('tenantId');
    const role = this.cls.get('userRole');

    if (!tenantId) throw new ForbiddenException();
    if (role !== 'SUPER_ADMIN' && role !== 'SCHOOL_ADMIN') {
      throw new ForbiddenException('Not allowed');
    }

    const student = await this.prisma.client.studentProfile.findFirst({
      where: { tenantId, systemCode: dto.systemCode },
      select: { id: true },
    });
    if (!student) throw new NotFoundException('Invalid system code');

    const academicYearId = await this.getActiveAcademicYearId();

    const scannedAt = new Date(dto.scannedAt);
    if (Number.isNaN(scannedAt.getTime())) {
      throw new BadRequestException('Invalid scannedAt');
    }

    const date = new Date(scannedAt);
    date.setHours(0, 0, 0, 0);

    const cutoff = new Date(date);
    cutoff.setHours(7, 15, 0, 0);

    const status =
      scannedAt > cutoff
        ? AttendanceStatus.LATE
        : AttendanceStatus.PRESENT;

    await this.prisma.client.gateAttendance.upsert({
      where: {
        studentId_academicYearId_date: {
          studentId: student.id,
          academicYearId,
          date,
        },
      },
      update: { arrivalTime: scannedAt, status },
      create: {
        tenantId,
        studentId: student.id,
        academicYearId,
        date,
        arrivalTime: scannedAt,
        status,
      },
    });

    return { status };
  }

  // =========================
  // PHASE 6.3 — PERIOD ATTENDANCE
  // =========================
  async markPeriod(dto: MarkAttendanceDto) {
    const tenantId = this.cls.get('tenantId');
    const role = this.cls.get('userRole');
    const userId = this.cls.get('userId');

    if (!tenantId) throw new ForbiddenException();

    const allowedRoles = ['TEACHER', 'SCHOOL_ADMIN'];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException();
    }

    const academicYearId = await this.getActiveAcademicYearId();
    const date = this.parseDateOnly(dto.date);

    let markedByTeacherId: string | undefined;

    if (role === 'TEACHER') {
      const teacher = await this.prisma.client.teacherProfile.findFirst({
        where: { tenantId, userId },
        select: { id: true },
      });
      if (!teacher) {
        throw new ForbiddenException('Teacher profile not found');
      }

      const assignment =
        await this.prisma.client.teacherGradeClass.findFirst({
          where: {
            teacherId: teacher.id,
            classId: dto.classId,
            academicYearId,
          },
        });
      if (!assignment) {
        throw new ForbiddenException('Not assigned to class');
      }

      markedByTeacherId = teacher.id;
    }

    const gatePresent = await this.prisma.client.gateAttendance.findMany({
      where: {
        tenantId,
        academicYearId,
        date,
        status: {
          in: [AttendanceStatus.PRESENT, AttendanceStatus.LATE],
        },
      },
      select: { studentId: true },
    });

    const allowedStudents = new Set(gatePresent.map(g => g.studentId));

    await Promise.all(
      dto.records
        .filter(r => allowedStudents.has(r.studentId))
        .map(r =>
          this.prisma.client.attendance.upsert({
            where: {
              tenantId_classId_academicYearId_studentId_date_period: {
                tenantId,
                classId: dto.classId,
                academicYearId,
                studentId: r.studentId,
                date,
                period: dto.period,
              },
            },
            update: {
              status: r.status,
              ...(markedByTeacherId && { markedByTeacherId }),
            },
            create: {
              tenantId,
              studentId: r.studentId,
              classId: dto.classId,
              academicYearId,
              date,
              period: dto.period,
              status: r.status,
              ...(markedByTeacherId && { markedByTeacherId }),
            },
          }),
        ),
    );

    return { success: true };
  }

  // =========================
  // PHASE 6.4 — CLASS REGISTER
  // =========================
  async getClassRegister(classId: string, dateStr: string) {
    const tenantId = this.cls.get('tenantId');
    const role = this.cls.get('userRole');
    const userId = this.cls.get('userId');

    if (!tenantId) throw new ForbiddenException();

    const allowedRoles = [
      'TEACHER',
      'SCHOOL_ADMIN',
      'PRINCIPAL',
      'SUPER_ADMIN',
    ];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException();
    }

    const academicYearId = await this.getActiveAcademicYearId();
    const date = this.parseDateOnly(dateStr);

    if (role === 'TEACHER') {
      const teacher = await this.prisma.client.teacherProfile.findFirst({
        where: { tenantId, userId },
        select: { id: true },
      });
      if (!teacher) throw new ForbiddenException();

      const assignment =
        await this.prisma.client.teacherGradeClass.findFirst({
          where: {
            teacherId: teacher.id,
            classId,
            academicYearId,
          },
        });
      if (!assignment) {
        throw new ForbiddenException('Not assigned to class');
      }
    }

    const roster = await this.prisma.client.studentGradeClass.findMany({
      where: {
        classId,
        academicYearId,
        student: { tenantId },
      },
      select: {
        studentId: true,
        classIndex: true,
        student: { select: { fullName: true, systemCode: true } },
      },
      orderBy: { classIndex: 'asc' },
    });

    const studentIds = roster.map(r => r.studentId);
    if (!studentIds.length) {
      return { classId, academicYearId, date, students: [] };
    }

    const gateRows = await this.prisma.client.gateAttendance.findMany({
      where: {
        tenantId,
        academicYearId,
        date,
        studentId: { in: studentIds },
      },
      select: { studentId: true, status: true, arrivalTime: true },
    });

    const gateByStudent = new Map(gateRows.map(g => [g.studentId, g]));

    const periodRows = await this.prisma.client.attendance.findMany({
      where: {
        tenantId,
        academicYearId,
        classId,
        date,
        studentId: { in: studentIds },
      },
      select: { studentId: true, period: true, status: true },
      orderBy: { period: 'asc' },
    });

    const periodByStudent = new Map<string, Record<number, string>>();
    for (const row of periodRows) {
      const obj = periodByStudent.get(row.studentId) ?? {};
      obj[row.period] = row.status;
      periodByStudent.set(row.studentId, obj);
    }

    const students = roster.map(r => {
      const gate = gateByStudent.get(r.studentId);
      const gateStatus = gate?.status ?? AttendanceStatus.ABSENT;

      return {
        studentId: r.studentId,
        name: r.student.fullName,
        systemCode: r.student.systemCode,
        classIndex: r.classIndex,
        gate: {
          status: gateStatus,
          arrivalTime: gate?.arrivalTime ?? null,
          isLate: gateStatus === AttendanceStatus.LATE,
        },
        periods: periodByStudent.get(r.studentId) ?? {},
      };
    });

    return { classId, academicYearId, date, students };
  }

  // =========================
  // PHASE 6.4 — DAILY SUMMARY
  // =========================
  async getDailySummary(dateStr: string) {
    const tenantId = this.cls.get('tenantId');
    const role = this.cls.get('userRole');

    if (!tenantId) throw new ForbiddenException();

    const allowedRoles = ['SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException();
    }

    const academicYearId = await this.getActiveAcademicYearId();
    const date = this.parseDateOnly(dateStr);

    const totalEnrolled = await this.prisma.client.studentGradeClass.count({
      where: {
        academicYearId,
        student: { tenantId },
      },
    });

    const gateCounts = await this.prisma.client.gateAttendance.groupBy({
      by: ['status'],
      where: {
        tenantId,
        academicYearId,
        date,
      },
      _count: { status: true },
    });

    const summaryByStatus = {
      PRESENT: 0,
      LATE: 0,
      ABSENT: 0,
    };

    for (const row of gateCounts) {
      summaryByStatus[row.status] = row._count.status;
    }

    const absentCalculated =
      totalEnrolled -
      summaryByStatus.PRESENT -
      summaryByStatus.LATE;

    summaryByStatus.ABSENT = Math.max(absentCalculated, 0);

    const perClass = await this.prisma.client.studentGradeClass.groupBy({
      by: ['classId'],
      where: {
        academicYearId,
        student: { tenantId },
      },
      _count: { studentId: true },
    });

    return {
      date,
      academicYearId,
      totals: {
        enrolled: totalEnrolled,
        present: summaryByStatus.PRESENT,
        late: summaryByStatus.LATE,
        absent: summaryByStatus.ABSENT,
      },
      perClass: perClass.map(c => ({
        classId: c.classId,
        totalStudents: c._count.studentId,
      })),
    };
  }

    // =========================
  // PHASE 6.4 — MONTHLY SUMMARY
  // =========================
  async getMonthlySummary(month: string) {
    const tenantId = this.cls.get('tenantId');
    const role = this.cls.get('userRole');

    if (!tenantId) throw new ForbiddenException();

    const allowedRoles = ['SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException();
    }

    // Parse month (YYYY-MM)
    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;

    if (
      !year ||
      monthIndex < 0 ||
      monthIndex > 11
    ) {
      throw new BadRequestException('Invalid month format (YYYY-MM)');
    }

    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 1);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const academicYearId = await this.getActiveAcademicYearId();

    // 1️⃣ Get enrolled students
    const students = await this.prisma.client.studentGradeClass.findMany({
      where: {
        academicYearId,
        student: { tenantId },
      },
      select: {
        studentId: true,
        student: { select: { fullName: true } },
      },
    });

    if (!students.length) {
      return { month, academicYearId, students: [] };
    }

    const studentIds = students.map(s => s.studentId);

    // 2️⃣ Group gate attendance by student + status
    const gateStats = await this.prisma.client.gateAttendance.groupBy({
      by: ['studentId', 'status'],
      where: {
        tenantId,
        academicYearId,
        date: {
          gte: startDate,
          lt: endDate,
        },
        studentId: { in: studentIds },
      },
      _count: { status: true },
    });

    // Build lookup: studentId → counts
    const statsMap = new Map<
      string,
      { PRESENT: number; LATE: number }
    >();

    for (const row of gateStats) {
      const obj =
        statsMap.get(row.studentId) ??
        { PRESENT: 0, LATE: 0 };

      if (row.status === AttendanceStatus.PRESENT) {
        obj.PRESENT = row._count.status;
      }
      if (row.status === AttendanceStatus.LATE) {
        obj.LATE = row._count.status;
      }

      statsMap.set(row.studentId, obj);
    }

    // Count total school days in this month (based on gate records)
    const totalSchoolDays = await this.prisma.client.gateAttendance
      .findMany({
        where: {
          tenantId,
          academicYearId,
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        select: { date: true },
        distinct: ['date'],
      })
      .then(rows => rows.length);

    // 3️⃣ Build final response
    const result = students.map(s => {
      const stats = statsMap.get(s.studentId) ?? {
        PRESENT: 0,
        LATE: 0,
      };

      const attendedDays = stats.PRESENT + stats.LATE;
      const absentDays = Math.max(
        totalSchoolDays - attendedDays,
        0,
      );

      const percentage =
        totalSchoolDays === 0
          ? 0
          : Number(
              ((attendedDays / totalSchoolDays) * 100).toFixed(2),
            );

      return {
        studentId: s.studentId,
        name: s.student.fullName,
        present: stats.PRESENT,
        late: stats.LATE,
        absent: absentDays,
        attendancePercentage: percentage,
      };
    });

    return {
      month,
      academicYearId,
      totalSchoolDays,
      students: result,
    };
  }

}
