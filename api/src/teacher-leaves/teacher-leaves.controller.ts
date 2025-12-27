import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { TeacherLeavesService } from "./teacher-leaves.service";
import { CreateTeacherLeaveDto } from "./dto/create-teacher-leave.dto";
import { LeaveDecisionDto } from "./dto/decision.dto";

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserRole } from "@prisma/client";

@Controller("teacher-leaves")
@UseGuards(JwtAuthGuard, RolesGuard) // 🔐 apply guards once
export class TeacherLeavesController {
  constructor(private readonly service: TeacherLeavesService) {}

  // ============================================================
  // 🧑‍🏫 TEACHER: Create leave request
  // ============================================================
  @Post()
  @Roles(UserRole.TEACHER)
  create(
    @Req() req,
    @Body() dto: CreateTeacherLeaveDto
  ) {
    return this.service.createLeave(
      req.user.id,
      req.user.tenantId,
      dto
    );
  }

  // ============================================================
  // 🧑‍🏫 TEACHER: View own leave requests
  // ============================================================
  @Get("my")
  @Roles(UserRole.TEACHER)
  myLeaves(
    @Req() req,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    return this.service.getMyLeaves(
      req.user.id,
      req.user.tenantId,
      from,
      to
    );
  }

  // ============================================================
  // 🧑‍💼 PRINCIPAL / ADMIN: View leave requests
  // ============================================================
  @Get()
  @Roles(UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  list(
    @Req() req,
    @Query("status") status?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("teacherId") teacherId?: string
  ) {
    return this.service.listLeaves(
      req.user.tenantId,
      status,
      from,
      to,
      teacherId
    );
  }

  // ============================================================
  // 🧑‍💼 PRINCIPAL / ADMIN: Approve leave
  // ============================================================
  @Post(":id/approve")
  @Roles(UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  approve(
    @Param("id") leaveId: string,
    @Req() req,
    @Body() dto: LeaveDecisionDto
  ) {
    return this.service.approveLeave(
      leaveId,
      req.user.id,
      dto.decisionNote
    );
  }

  // ============================================================
  // 🧑‍💼 PRINCIPAL / ADMIN: Reject leave
  // ============================================================
  @Post(":id/reject")
  @Roles(UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  reject(
    @Param("id") leaveId: string,
    @Req() req,
    @Body() dto: LeaveDecisionDto
  ) {
    return this.service.rejectLeave(
      leaveId,
      req.user.id,
      dto.decisionNote
    );
  }

  // ============================================================
  // 🧑‍🏫 TEACHER: Cancel own leave
  // ============================================================
  @Post(":id/cancel")
  @Roles(UserRole.TEACHER)
  cancel(
    @Param("id") leaveId: string,
    @Req() req
  ) {
    return this.service.cancelLeave(
      leaveId,
      req.user.id
    );
  }
}
