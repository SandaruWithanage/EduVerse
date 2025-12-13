import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Gender,
  MotherTongue,
  Religion,
  Ethnicity,
  TeacherAppointmentType,
  TeacherEmploymentStatus,
} from '@prisma/client';

export class CreateTeacherDto {
  @IsString()
  fullName: string;

  @IsString()
  @IsOptional()
  initials?: string;

  @IsString()
  nic: string;

  @IsString()
  tin: string;

  /**
   * Prisma schema: subjectCodes String[]
   * Required at DB-level; we’ll default to [] in the service if omitted.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subjectCodes?: string[];

  @IsEnum(TeacherAppointmentType)
  appointmentType: TeacherAppointmentType;

  @IsDateString()
  serviceStart: string; // ISO string from API → Date in service

  @IsEnum(TeacherEmploymentStatus)
  @IsOptional()
  employmentStatus?: TeacherEmploymentStatus;

  @IsDateString()
  dateOfBirth: string; // ISO string from API → Date in service

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(MotherTongue)
  motherTongue: MotherTongue;

  @IsEnum(Religion)
  religion: Religion;

  @IsEnum(Ethnicity)
  ethnicity: Ethnicity;

  /**
   * Optional: allows linking a user account to this teacher profile.
   * (Schema has userId String? @unique)
   */
  @IsString()
  @IsOptional()
  userId?: string;

  /**
   * Optional: ONLY for SUPER_ADMIN flows where CLS tenantId may be null.
   * We will ignore this for non-super-admin requests in the service.
   */
  @IsString()
  @IsOptional()
  tenantId?: string;
}
