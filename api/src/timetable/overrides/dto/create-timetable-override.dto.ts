import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { TimetableOverrideReason } from "@prisma/client";

export class CreateTimetableOverrideDto {
  @IsUUID()
  slotId: string;

  @IsDateString()
  dateFrom: string;

  @IsDateString()
  dateTo: string;

  @IsOptional()
  @IsUUID()
  overrideTeacherId?: string;

  @IsOptional()
  @IsUUID()
  overrideSubjectId?: string;

  @IsOptional()
  @IsEnum(TimetableOverrideReason)
  reason?: TimetableOverrideReason;

  @IsOptional()
  @IsString()
  note?: string;
}
