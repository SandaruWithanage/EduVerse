import { Controller, Get, Req } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('teachers')
// Only these roles can view teacher lists
@Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.CLERK, UserRole.PRINCIPAL) 
export class TeachersController {
  
  @Get()
  findAll(@Req() req: any) {
    // 🔒 RLS VALIDATION:
    // This call uses the specific Prisma client instance attached to this request.
    // It effectively runs: SELECT * FROM "TeacherProfile" WHERE "tenantId" = current_user_tenant;
    return req.prisma.teacherProfile.findMany();
  }
}