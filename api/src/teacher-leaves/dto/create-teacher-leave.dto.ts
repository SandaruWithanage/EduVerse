import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveReason } from '@prisma/client';

export class CreateTeacherLeaveDto {
  @IsDateString()
  dateFrom: string;

  @IsDateString()
  dateTo: string;

  @IsEnum(LeaveReason)
  reasonCode: LeaveReason;

  @IsOptional()
  @IsString()
  note?: string;
}
