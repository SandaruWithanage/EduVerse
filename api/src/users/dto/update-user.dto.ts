import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '@prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Override fields we actually want to allow updating

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // We DO NOT expose tenantId here to avoid cross-tenant moves via update
  tenantId?: never;
  
  // We DO NOT expose password here (use reset-password endpoint)
  password?: never;
}