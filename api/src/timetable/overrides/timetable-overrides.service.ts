import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { CreateTimetableOverrideDto } from "./dto/create-timetable-override.dto";
import { UpdateTimetableOverrideDto } from "./dto/update-timetable-override.dto";
import { OverrideQueryDto } from "./dto/override-query.dto";
import { LeaveStatus, TimetableOverrideReason } from "@prisma/client";

@Injectable()
export class TimetableOverridesService {
  constructor(private readonly prisma: PrismaService) {}

  private rangesOverlap(aFrom: Date, aTo: Date, bFrom: Date, bTo: Date) {
    return aFrom <= bTo && aTo >= bFrom;
  }

  async createOverride(
      tenantId: string,
      createdByUserId: string,
      dto: CreateTimetableOverrideDto
      ) {
        const dateFrom = new Date(dto.dateFrom);
        const dateTo = new Date(dto.dateTo);

        // 1️⃣ Date validation
        if (dateFrom > dateTo) {
          throw new BadRequestException("dateFrom must be <= dateTo");
        }

        // 2️⃣ Slot must exist and belong to tenant
      const slot = await this.prisma.client.timetableSlot.findFirst({
          where: {
            id: dto.slotId,
            tenantId,
            isActive: true,
          },
          select: {
            id: true,
            academicYearId: true,
            dayOfWeek: true,
            periodNumber: true,
          },
        });

        if (!slot) {
          throw new BadRequestException("Invalid timetable slot");
        }

        // 3️⃣ BLOCK overlapping overrides for SAME SLOT (🔥 FIX)
      const slotOverlap = await this.prisma.client.timetableOverride.findFirst({
          where: {
            tenantId,
            slotId: dto.slotId,
            isActive: true,
            AND: [
              { dateFrom: { lte: dateTo } },
              { dateTo: { gte: dateFrom } },
            ],
          },
          select: { id: true },
        });

        if (slotOverlap) {
          throw new BadRequestException(
            "An override already exists for this slot in this date range"
          );
        }

        // 4️⃣ Validate override teacher (if provided)
        if (dto.overrideTeacherId) {
          const teacherExists = await this.prisma.client.teacherProfile.findFirst({
            where: {
              id: dto.overrideTeacherId,
              tenantId,
            },
            select: { id: true },
          });

          if (!teacherExists) {
            throw new BadRequestException("Invalid substitute teacher");
          }

          // 5️⃣ Teacher leave check
        const leave = await this.prisma.client.teacherLeave.findFirst({
            where: {
              tenantId,
              teacherId: dto.overrideTeacherId,
              status: LeaveStatus.APPROVED,
              AND: [
                { dateFrom: { lte: dateTo } },
                { dateTo: { gte: dateFrom } },
              ],
            },
            select: { id: true },
          });

          if (leave) {
            throw new BadRequestException(
              "Selected substitute teacher is on approved leave"
            );
          }

          // 6️⃣ Teacher-period override clash (your existing logic, kept)
        const overrideClash = await this.prisma.client.timetableOverride.findFirst({
            where: {
              tenantId,
              isActive: true,
              overrideTeacherId: dto.overrideTeacherId,
              slot: {
                academicYearId: slot.academicYearId,
                dayOfWeek: slot.dayOfWeek,
                periodNumber: slot.periodNumber,
              },
              AND: [
                { dateFrom: { lte: dateTo } },
                { dateTo: { gte: dateFrom } },
              ],
            },
            select: { id: true },
          });

          if (overrideClash) {
            throw new BadRequestException(
              "Override teacher already has an override in this period range"
            );
          }
        }

        // 7️⃣ SAFE CREATE
      return this.prisma.client.timetableOverride.create({
          data: {
            tenantId,
            academicYearId: slot.academicYearId,
            slotId: dto.slotId,
            dateFrom,
            dateTo,
            overrideTeacherId: dto.overrideTeacherId ?? null,
            overrideSubjectId: dto.overrideSubjectId ?? null,
            reason: dto.reason ?? TimetableOverrideReason.SUBSTITUTION,
            note: dto.note,
            isActive: true,
            createdByUserId,
          },
          include: {
            slot: true,
            overrideTeacher: { select: { fullName: true } },
            overrideSubject: { select: { name: true } },
          },
        });
      }


  async listOverrides(tenantId: string, q: OverrideQueryDto) {
    const where: any = { tenantId, isActive: true };

    if (q.academicYearId) where.academicYearId = q.academicYearId;
    if (q.slotId) where.slotId = q.slotId;
    if (q.overrideTeacherId) where.overrideTeacherId = q.overrideTeacherId;

    if (q.from && q.to) {
      const from = new Date(q.from);
      const to = new Date(q.to);
      where.AND = [{ dateFrom: { lte: to } }, { dateTo: { gte: from } }];
    }

    return this.prisma.client.timetableOverride.findMany({
      where,
      orderBy: [{ dateFrom: "desc" }],
      include: {
        slot: {
          include: {
            classroom: { select: { classCode: true } },
            subject: { select: { name: true } },
            teacher: { select: { fullName: true } },
          },
        },
        overrideTeacher: { select: { fullName: true } },
        overrideSubject: { select: { name: true } },
        createdBy: { select: { email: true, role: true } },
      },
    });
  }

  async updateOverride(tenantId: string, id: string, userId: string, dto: UpdateTimetableOverrideDto) {
    const existing = await this.prisma.client.timetableOverride.findFirst({
      where: { tenantId, id },
      include: { slot: true },
    });

    if (!existing) throw new NotFoundException("Override not found");

    const dateFrom = dto.dateFrom ? new Date(dto.dateFrom) : existing.dateFrom;
    const dateTo = dto.dateTo ? new Date(dto.dateTo) : existing.dateTo;

    if (dateFrom > dateTo) throw new BadRequestException("dateFrom must be <= dateTo");

    // if overriding teacher changed -> validate leave overlap
    const newOverrideTeacherId = dto.overrideTeacherId ?? existing.overrideTeacherId;

    if (newOverrideTeacherId) {
      const leave = await this.prisma.client.teacherLeave.findFirst({
        where: {
          tenantId,
          teacherId: newOverrideTeacherId,
          status: LeaveStatus.APPROVED,
          AND: [{ dateFrom: { lte: dateTo } }, { dateTo: { gte: dateFrom } }],
        },
        select: { id: true },
      });
      if (leave) throw new BadRequestException("Override teacher is on APPROVED leave in this date range");

      const clash = await this.prisma.client.timetableOverride.findFirst({
        where: {
          tenantId,
          id: { not: id },
          isActive: true,
          overrideTeacherId: newOverrideTeacherId,
          slot: {
            academicYearId: existing.academicYearId,
            dayOfWeek: existing.slot.dayOfWeek,
            periodNumber: existing.slot.periodNumber,
          },
          AND: [{ dateFrom: { lte: dateTo } }, { dateTo: { gte: dateFrom } }],
        },
        select: { id: true },
      });

      if (clash) throw new BadRequestException("Override teacher already has an override in this period range");
    }

    return this.prisma.client.timetableOverride.update({
      where: { id },
      data: {
        dateFrom: dto.dateFrom ? dateFrom : undefined,
        dateTo: dto.dateTo ? dateTo : undefined,
        overrideTeacherId: dto.overrideTeacherId ?? undefined,
        overrideSubjectId: dto.overrideSubjectId ?? undefined,
        reason: dto.reason ?? undefined,
        note: dto.note ?? undefined,
        createdByUserId: userId, // keep latest editor (simple audit)
      },
      include: {
        slot: true,
        overrideTeacher: { select: { fullName: true } },
        overrideSubject: { select: { name: true } },
      },
    });
  }

  async deleteOverride(tenantId: string, id: string) {
    const existing = await this.prisma.client.timetableOverride.findFirst({
      where: { tenantId, id },
      select: { id: true },
    });

    if (!existing) throw new NotFoundException("Override not found");

    return this.prisma.client.timetableOverride.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
