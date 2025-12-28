import { IsOptional, IsString, IsUUID } from "class-validator";
import { Type } from "class-transformer";

export class OverrideQueryDto {
  @IsOptional()
  @Type(() => Number)
  academicYearId?: number;

  @IsOptional()
  @IsUUID()
  slotId?: string;

  @IsOptional()
  @IsUUID()
  overrideTeacherId?: string;

  @IsOptional()
  @IsString()
  from?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  to?: string; // YYYY-MM-DD
}
