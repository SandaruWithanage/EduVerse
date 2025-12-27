import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateTeacherLeaveDto } from "./dto/create-teacher-leave.dto";
import { LeaveStatus } from "@prisma/client";

@Injectable()
export class TeacherLeavesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // 🧑‍🏫 TEACHER: Create leave
  // ============================================================
  async createLeave(
    userId: string,
    tenantId: string,
    dto: CreateTeacherLeaveDto
  ) {
    const dateFrom = new Date(dto.dateFrom);
    const dateTo = new Date(dto.dateTo);

    if (dateFrom > dateTo) {
      throw new BadRequestException("dateFrom must be <= dateTo");
    }

    // Find teacher profile linked to user
    const teacher = await this.prisma.teacherProfile.findFirst({
      where: { tenantId, userId },
      select: { id: true },
    });

    if (!teacher) {
      throw new ForbiddenException("Teacher profile not found");
    }

    // Prevent overlapping leaves
    const overlap = await this.prisma.teacherLeave.findFirst({
      where: {
        tenantId,
        teacherId: teacher.id,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        AND: [
          { dateFrom: { lte: dateTo } },
          { dateTo: { gte: dateFrom } },
        ],
      },
    });

    if (overlap) {
      throw new BadRequestException("Overlapping leave request exists");
    }

    return this.prisma.teacherLeave.create({
      data: {
        tenantId,
        teacherId: teacher.id,
        dateFrom,
        dateTo,
        reasonCode: dto.reasonCode,
        note: dto.note,
        status: LeaveStatus.PENDING,
      },
    });
  }

  // ============================================================
  // 🧑‍🏫 TEACHER: View own leaves
  // ============================================================
  async getMyLeaves(
    userId: string,
    tenantId: string,
    from?: string,
    to?: string
  ) {
    const teacher = await this.prisma.teacherProfile.findFirst({
      where: { tenantId, userId },
      select: { id: true },
    });

    if (!teacher) {
      throw new ForbiddenException("Teacher profile not found");
    }

    const where: any = {
      tenantId,
      teacherId: teacher.id,
    };

    if (from && to) {
      where.AND = [
        { dateFrom: { lte: new Date(to) } },
        { dateTo: { gte: new Date(from) } },
      ];
    }

    return this.prisma.teacherLeave.findMany({
      where,
      orderBy: { requestedAt: "desc" },
    });
  }

  // ============================================================
  // 🧑‍💼 ADMIN / PRINCIPAL: List leaves
  // ============================================================
  async listLeaves(
    tenantId: string,
    status?: string,
    from?: string,
    to?: string,
    teacherId?: string
  ) {
    const where: any = { tenantId };

    if (status) where.status = status;
    if (teacherId) where.teacherId = teacherId;

    if (from && to) {
      where.AND = [
        { dateFrom: { lte: new Date(to) } },
        { dateTo: { gte: new Date(from) } },
      ];
    }

    return this.prisma.teacherLeave.findMany({
      where,
      include: {
        teacher: { select: { id: true, fullName: true } },
      },
      orderBy: { requestedAt: "desc" },
    });
  }

  // ============================================================
  // 🧑‍💼 ADMIN / PRINCIPAL: Approve leave
  // ============================================================
  async approveLeave(
    leaveId: string,
    approverUserId: string,
    decisionNote?: string
  ) {
    const leave = await this.prisma.teacherLeave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException("Leave request not found");
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException("Only PENDING leaves can be approved");
    }

    // 🔐 Critical business rule
    if (leave.teacherId === approverUserId) {
      throw new ForbiddenException("You cannot approve your own leave");
    }

    return this.prisma.teacherLeave.update({
      where: { id: leaveId },
      data: {
        status: LeaveStatus.APPROVED,
        approvedByUserId: approverUserId,
        approvedAt: new Date(),
        decisionNote,
      },
    });
  }

  // ============================================================
  // 🧑‍💼 ADMIN / PRINCIPAL: Reject leave
  // ============================================================
  async rejectLeave(
    leaveId: string,
    approverUserId: string,
    decisionNote?: string
  ) {
    const leave = await this.prisma.teacherLeave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException("Leave request not found");
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException("Only PENDING leaves can be rejected");
    }

    return this.prisma.teacherLeave.update({
      where: { id: leaveId },
      data: {
        status: LeaveStatus.REJECTED,
        approvedByUserId: approverUserId,
        approvedAt: new Date(),
        decisionNote,
      },
    });
  }

  // ============================================================
  // 🧑‍🏫 TEACHER: Cancel leave
  // ============================================================
  async cancelLeave(
    leaveId: string,
    userId: string
  ) {
    const teacher = await this.prisma.teacherProfile.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!teacher) {
      throw new ForbiddenException("Teacher profile not found");
    }

    const leave = await this.prisma.teacherLeave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException("Leave request not found");
    }

    if (leave.teacherId !== teacher.id) {
      throw new ForbiddenException("Not your leave request");
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException("Only PENDING leaves can be cancelled");
    }

    return this.prisma.teacherLeave.update({
      where: { id: leaveId },
      data: { status: LeaveStatus.CANCELLED },
    });
  }
}
