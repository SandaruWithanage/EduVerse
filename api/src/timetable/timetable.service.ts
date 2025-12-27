import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateTimetableSlotDto } from "./dto/create-timetable-slot.dto";
import { UpdateTimetableSlotDto } from "./dto/update-timetable-slot.dto";
import { TimetableQueryDto } from "./dto/timetable-query.dto";

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper: compare "HH:MM"
  private isStartBeforeEnd(start: string, end: string) {
    return start < end; // works because "08:25" < "09:05" in string compare
  }

  // ============================================================
  // CREATE SLOT
  // ============================================================
  async createSlot(tenantId: string, dto: CreateTimetableSlotDto) {
    if (!this.isStartBeforeEnd(dto.startTime, dto.endTime)) {
      throw new BadRequestException("startTime must be before endTime");
    }

    // ✅ Safety check: teacher cannot be booked in 2 classes same day+period+year
    const teacherClash = await this.prisma.client.timetableSlot.findFirst({
      where: {
        tenantId,
        academicYearId: dto.academicYearId,
        dayOfWeek: dto.dayOfWeek,
        periodNumber: dto.periodNumber,
        teacherId: dto.teacherId,
        isActive: true,
      },
      select: { id: true },
    });

    if (teacherClash) {
      throw new BadRequestException("Teacher is already assigned to another class in this period");
    }

    // ✅ Create (class-period uniqueness is enforced by Prisma @@unique)
    try {
      return await this.prisma.client.timetableSlot.create({
        data: {
          tenantId,
          academicYearId: dto.academicYearId,
          dayOfWeek: dto.dayOfWeek,
          periodNumber: dto.periodNumber,
          startTime: dto.startTime,
          endTime: dto.endTime,
          classId: dto.classId,
          subjectId: dto.subjectId,
          teacherId: dto.teacherId,
          room: dto.room,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (e: any) {
      // Prisma unique violation => class already has slot at same time
      throw new BadRequestException("This class already has a slot for this day & period");
    }
  }

  // ============================================================
  // LIST SLOTS (FILTERS)
  // ============================================================
  async listSlots(tenantId: string, q: TimetableQueryDto) {
    const where: any = { tenantId };

    if (q.academicYearId) where.academicYearId = q.academicYearId;
    if (q.dayOfWeek) where.dayOfWeek = q.dayOfWeek;
    if (q.periodNumber) where.periodNumber = q.periodNumber;
    if (q.classId) where.classId = q.classId;
    if (q.teacherId) where.teacherId = q.teacherId;
    if (q.subjectId) where.subjectId = q.subjectId;

    if (q.fromPeriod && q.toPeriod) {
      where.periodNumber = { gte: q.fromPeriod, lte: q.toPeriod };
    }

    return this.prisma.client.timetableSlot.findMany({
      where,
      orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
      include: {
        classroom: { select: { classCode: true } },
        teacher: { select: { fullName: true } },
        subject: { select: { name: true, code: true } },
      },
    });
  }

  // ============================================================
  // UPDATE SLOT
  // ============================================================
  async updateSlot(tenantId: string, id: string, dto: UpdateTimetableSlotDto) {
    const existing = await this.prisma.client.timetableSlot.findFirst({
      where: { tenantId, id },
    });

    if (!existing) throw new NotFoundException("Timetable slot not found");

    const start = dto.startTime ?? existing.startTime;
    const end = dto.endTime ?? existing.endTime;

    if (!this.isStartBeforeEnd(start, end)) {
      throw new BadRequestException("startTime must be before endTime");
    }

    const newAcademicYearId = dto.academicYearId ?? existing.academicYearId;
    const newDay = dto.dayOfWeek ?? existing.dayOfWeek;
    const newPeriod = dto.periodNumber ?? existing.periodNumber;
    const newTeacherId = dto.teacherId ?? existing.teacherId;

    // ✅ Teacher clash check (ignore current slot)
    const clash = await this.prisma.client.timetableSlot.findFirst({
      where: {
        tenantId,
        id: { not: id },
        academicYearId: newAcademicYearId,
        dayOfWeek: newDay,
        periodNumber: newPeriod,
        teacherId: newTeacherId,
        isActive: true,
      },
      select: { id: true },
    });

    if (clash) {
      throw new BadRequestException("Teacher is already assigned to another class in this period");
    }

    try {
      return await this.prisma.client.timetableSlot.update({
        where: { id },
        data: {
          academicYearId: dto.academicYearId,
          dayOfWeek: dto.dayOfWeek,
          periodNumber: dto.periodNumber,
          startTime: dto.startTime,
          endTime: dto.endTime,
          classId: dto.classId,
          subjectId: dto.subjectId,
          teacherId: dto.teacherId,
          room: dto.room,
          isActive: dto.isActive,
        },
      });
    } catch (e: any) {
      throw new BadRequestException("This update conflicts with an existing class day/period slot");
    }
  }

  // ============================================================
  // DELETE SLOT (SOFT DELETE)
  // ============================================================
  async deleteSlot(tenantId: string, id: string) {
    const existing = await this.prisma.client.timetableSlot.findFirst({
      where: { tenantId, id },
    });

    if (!existing) throw new NotFoundException("Timetable slot not found");

    // Soft delete: keep data for audit/history
    return this.prisma.client.timetableSlot.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ============================================================
  // TEACHER DAILY VIEW (Derived view)
  // ============================================================
  async teacherDaily(tenantId: string, teacherId: string, dayOfWeek: any, academicYearId: number) {
    return this.prisma.client.timetableSlot.findMany({
      where: {
        tenantId,
        teacherId,
        academicYearId,
        dayOfWeek,
        isActive: true,
      },
      orderBy: { periodNumber: "asc" },
      include: {
        classroom: { select: { classCode: true } },
        subject: { select: { name: true } },
      },
    });
  }

  // ============================================================
  // CLASS WEEKLY VIEW (Derived view)
  // ============================================================
  async classWeekly(tenantId: string, classId: string, academicYearId: number) {
    return this.prisma.client.timetableSlot.findMany({
      where: {
        tenantId,
        classId,
        academicYearId,
        isActive: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
      include: {
        teacher: { select: { fullName: true } },
        subject: { select: { name: true } },
      },
    });
  }
}
