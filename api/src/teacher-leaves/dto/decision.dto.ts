import { IsOptional, IsString } from 'class-validator';

export class LeaveDecisionDto {
  @IsOptional()
  @IsString()
  decisionNote?: string;
}
