import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { BulkEnrollDto } from './dto/bulk-enroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  // ✅ POST /enrollment/bulk
  @Post('enrollment/bulk')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  bulkEnroll(@Body() dto: BulkEnrollDto) {
    return this.enrollmentService.bulkEnroll(dto);
  }

  // ✅ GET /classes/:id/students
  @Get('classes/:id/students')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER)
  getClassStudents(@Param('id') classId: string) {
    return this.enrollmentService.getClassStudents(classId);
  }
}
