import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { TimetableService } from "./timetable.service";
import { CreateTimetableSlotDto } from "./dto/create-timetable-slot.dto";
import { UpdateTimetableSlotDto } from "./dto/update-timetable-slot.dto";
import { TimetableQueryDto } from "./dto/timetable-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole, DayOfWeek } from "@prisma/client";

@Controller("timetable")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimetableController {
  constructor(private readonly service: TimetableService) {}

  // ============================================================
  // ADMIN: Create slot
  // ============================================================
  @Post("slots")
  @Roles(UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  createSlot(@Req() req, @Body() dto: CreateTimetableSlotDto) {
    return this.service.createSlot(req.user.tenantId, dto);
  }

  // ============================================================
  // ADMIN: List slots (filters)
  // ============================================================
  @Get("slots")
  @Roles(UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  listSlots(@Req() req, @Query() q: TimetableQueryDto) {
    return this.service.listSlots(req.user.tenantId, q);
  }

  // ============================================================
  // ADMIN: Update slot
  // ============================================================
  @Patch("slots/:id")
  @Roles(UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  updateSlot(@Req() req, @Param("id") id: string, @Body() dto: UpdateTimetableSlotDto) {
    return this.service.updateSlot(req.user.tenantId, id, dto);
  }

  // ============================================================
  // ADMIN: Delete slot (soft delete)
  // ============================================================
  @Delete("slots/:id")
  @Roles(UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  deleteSlot(@Req() req, @Param("id") id: string) {
    return this.service.deleteSlot(req.user.tenantId, id);
  }

  // ============================================================
  // TEACHER: Daily timetable view
  // ============================================================
  @Get("teacher/:teacherId/daily")
  @Roles(UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  teacherDaily(
    @Req() req,
    @Param("teacherId") teacherId: string,
    @Query("dayOfWeek") dayOfWeek: DayOfWeek,
    @Query("academicYearId") academicYearId: string,
  ) {
    return this.service.teacherDaily(req.user.tenantId, teacherId, dayOfWeek, Number(academicYearId));
  }

  // ============================================================
  // CLASS: Weekly timetable view
  // ============================================================
  @Get("class/:classId/weekly")
  @Roles(UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  classWeekly(
    @Req() req,
    @Param("classId") classId: string,
    @Query("academicYearId") academicYearId: string,
  ) {
    return this.service.classWeekly(req.user.tenantId, classId, Number(academicYearId));
  }
}
