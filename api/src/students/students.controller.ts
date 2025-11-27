import { Controller, Get, Req } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('students')
// Define who is allowed to view the student list
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.SCHOOL_ADMIN,
  UserRole.PRINCIPAL,
  UserRole.TEACHER,
  UserRole.CLERK
)
export class StudentsController {
  
  @Get()
  findAll( @Req() req: any) {
    // 🔒 RLS VALIDATION:
    // This query is intercepted by Prisma.
    // It injects: WHERE "tenantId" = current_user_tenant
    return req.prisma.studentProfile.findMany();
  }
}
