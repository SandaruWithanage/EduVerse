import { IsISO8601, IsString } from 'class-validator';

export class GateScanDto {
  @IsString()
  systemCode: string;

  @IsISO8601()
  scannedAt: string;
}
