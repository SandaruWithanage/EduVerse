import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { GateScanDto } from './dto/gate-scan.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // =========================
  // WRITE APIs (Phase 6.2 / 6.3)
  // =========================

  // Gate scan (device later, admin for now)
  @Post('gate/scan')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  gateScan(@Body() dto: GateScanDto) {
    return this.attendanceService.gateScan(dto);
  }

  // Period attendance
  @Post('mark')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  markPeriod(@Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markPeriod(dto);
  }

  // =========================
  // READ APIs (Phase 6.4)
  // =========================

  // 1️⃣ Class register
  @Get('class/:classId')
  @Roles(
    UserRole.TEACHER,
    UserRole.SCHOOL_ADMIN,
    UserRole.PRINCIPAL,
    UserRole.SUPER_ADMIN,
  )
  getClassRegister(
    @Param('classId') classId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getClassRegister(classId, date);
  }
  
  // 2️⃣ Daily summary
  @Get('summary')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN)
  getDailySummary(@Query('date') date: string) {
    return this.attendanceService.getDailySummary(date);
  }
  
  // 3️⃣ Monthly summary
  @Get('summary/month')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN)
  getMonthlySummary(@Query('month') month: string) {
    return this.attendanceService.getMonthlySummary(month);
  }
}
