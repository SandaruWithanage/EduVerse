import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Matches, Max, Min } from "class-validator";
import { DayOfWeek } from "@prisma/client";

export class UpdateTimetableSlotDto {
  @IsOptional()
  @IsInt()
  academicYearId?: number;

  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  periodNumber?: number;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
