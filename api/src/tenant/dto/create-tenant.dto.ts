import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { SchoolType, SchoolMedium } from '@prisma/client';

// Helper object to map Frontend inputs to Prisma Enums
const SchoolTypeMap = {
  '1AB': SchoolType.ONE_AB,
  '1C': SchoolType.ONE_C,
  '2': SchoolType.TYPE_2,
  '3': SchoolType.TYPE_3,
};

export class CreateTenantDto {
  @IsString()
  name: string;

  @IsString()
  schoolCode: string;

  // TRANSFORMER LOGIC:
  // If the input is "1AB", convert it to "ONE_AB" before validation
  @Transform(({ value }) => SchoolTypeMap[value] || value)
  @IsEnum(SchoolType)
  schoolType: SchoolType;

  @IsOptional()
  @IsString()
  province?: string;

  @IsString()
  district: string;

  @IsString()
  zone: string;

  @IsString()
  division: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(SchoolMedium, { each: true })
  mediums: SchoolMedium[];

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
