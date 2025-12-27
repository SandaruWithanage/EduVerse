import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Matches, Max, Min } from "class-validator";
import { DayOfWeek } from "@prisma/client";

export class CreateTimetableSlotDto {
  @IsInt()
  academicYearId: number;

  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsInt()
  @Min(1)
  @Max(20) // safe upper limit (you can change later)
  periodNumber: number;

  // Time format "HH:MM"
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;

  @IsUUID()
  classId: string;

  @IsUUID()
  subjectId: string;

  @IsUUID()
  teacherId: string;

  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
