import { Controller, Get, Req } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('students')
// Only these roles can view student lists
@Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.CLERK, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN)
export class StudentsController {
  
  @Get()
  findAll(@Req() req: any) {
    // 🔒 RLS VALIDATION:
    // If logged in as School A Admin, this returns ONLY School A students.
    // If logged in as SUPER_ADMIN, RLS policy (if configured for SA) allows all or specific access.
    return req.prisma.studentProfile.findMany();
  }
}