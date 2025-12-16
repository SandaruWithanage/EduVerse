import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import {
  Gender,
  MotherTongue,
  Religion,
  Ethnicity,
  SchoolMedium,
} from '@prisma/client';

export class StudentProfileDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  initials?: string;

  @IsDateString()
  dateOfBirth: string; // ISO (YYYY-MM-DD)

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  nic?: string;

  @IsOptional()
  @IsString()
  birthCertificateNo?: string;

  @IsOptional()
  @IsString()
  civilStatus?: string; // enum later

  @IsOptional()
  @IsEnum(SchoolMedium)
  medium?: SchoolMedium;

  @IsString()
  indexNumber: string;

  @IsString()
  admissionNumber: string;

  @IsDateString()
  admissionDate: string;

  @IsEnum(MotherTongue)
  motherTongue: MotherTongue;

  @IsEnum(Religion)
  religion: Religion;

  @IsEnum(Ethnicity)
  ethnicity: Ethnicity;
}
