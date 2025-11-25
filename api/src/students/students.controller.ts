import { Controller, Get, Req } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('students')
@Roles('SCHOOL_ADMIN', 'TEACHER', 'CLERK') // Who can see students?
export class StudentsController {
  
  @Get()
  findAll(@Req() req: any) {
    // Direct RLS call. 
    // If logged in as School A, this returns ONLY School A students.
    return req.prisma.studentProfile.findMany();
  }
}