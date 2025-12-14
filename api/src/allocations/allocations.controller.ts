import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AllocationsController {
  constructor(private readonly service: AllocationsService) {}

  @Post('assign-subject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  assign(@Body() dto: AssignTeacherDto) {
    return this.service.assignTeacher(dto);
  }

  @Get(':id/schedule')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  getSchedule(@Param('id') teacherId: string) {
    return this.service.getTeacherSchedule(teacherId);
  }
}
