import {
  IsString,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Gender,
  MotherTongue,
  Religion,
  Ethnicity,
} from '@prisma/client';

export class CreateStudentDto {
  @IsString()
  fullName: string;

  @IsString()
  initials: string;

  // ✅ FIXED
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  indexNumber: string;

  @IsString()
  admissionNumber: string;

  // ✅ FIXED
  @IsDate()
  @Type(() => Date)
  admissionDate: Date;

  @IsEnum(MotherTongue)
  motherTongue: MotherTongue;

  @IsEnum(Religion)
  religion: Religion;

  @IsEnum(Ethnicity)
  ethnicity: Ethnicity;
}
