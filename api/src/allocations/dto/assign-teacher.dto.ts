import { IsInt, IsString } from 'class-validator';

export class AssignTeacherDto {
  @IsString()
  teacherId: string;

  @IsString()
  subjectId: string;

  @IsString()
  classId: string;

  @IsInt()
  academicYearId: number;
}
