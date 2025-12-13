import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ enforce auth + roles
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER) // ✅ match spec
  findAll(@Query('grade') grade?: string) {
  return this.subjectsService.findAll(grade ? Number(grade) : undefined);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER) // ✅ match spec
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }

}
