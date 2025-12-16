import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { AddressType } from '@prisma/client';

export class StudentAddressDto {
  @IsEnum(AddressType)
  type: AddressType; // PERMANENT | CURRENT

  @IsString()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsString()
  gsDivisionCode: string;

  @IsString()
  districtCode: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsString()
  mobile: string;

  @IsOptional()
  @IsDateString()
  residingFromDate?: string;
}
