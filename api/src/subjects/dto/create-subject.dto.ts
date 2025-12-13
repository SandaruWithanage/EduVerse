import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { GradeLevel } from '@prisma/client';

export class CreateSubjectDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  gradeLevel: GradeLevel;

  @IsArray()
  @IsInt({ each: true })
  validGrades: number[];

  @IsBoolean()
  isExamSubject: boolean;

  @IsBoolean()
  isCreditBearing: boolean;

  @IsOptional()
  @IsInt()
  credits?: number;

  @IsOptional()
  @IsString()
  stream?: string;

  @IsString()
  curriculumId: string;
}
