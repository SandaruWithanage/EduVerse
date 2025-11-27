import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  /**
   * Optional tenant only for SUPER_ADMIN.
   * - SUPER_ADMIN can set this when creating a School Admin / Principal / etc.
   * - SCHOOL_ADMIN must NOT send tenantId (we’ll ignore or reject it in logic).
   */
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
