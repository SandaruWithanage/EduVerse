import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";
import { DayOfWeek } from "@prisma/client";
import { Type } from "class-transformer";

export class TimetableQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  academicYearId?: number;

  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  periodNumber?: number;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  fromPeriod?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  toPeriod?: number;
}
