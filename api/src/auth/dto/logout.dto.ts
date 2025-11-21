// src/auth/dto/logout.dto.ts
import { IsString } from 'class-validator';

export class LogoutDto {
  @IsString()
  refreshToken: string;
}
