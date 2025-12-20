import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

/**
 * One student's attendance record for a period
 */
export class AttendanceRecordDto {
  @IsString()
  studentId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

/**
 * Teacher marks attendance for one class & one period
 */
export class MarkAttendanceDto {
  @IsString()
  classId: string;

  @IsInt()
  @Min(1)
  period: number;

  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}
