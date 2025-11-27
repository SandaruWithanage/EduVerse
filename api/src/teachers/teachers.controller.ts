import { Controller, Get, Req } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('teachers')
// Only these roles can view the teacher list
@Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.CLERK, UserRole.PRINCIPAL)
export class TeachersController {
  
  @Get()
  findAll( @Req() req: any) {
    // 🔒 RLS VALIDATION:
    // This uses the request-scoped Prisma client.
    // It automatically applies: WHERE "tenantId" = current_user_tenant
    return req.prisma.teacherProfile.findMany();
  }
}