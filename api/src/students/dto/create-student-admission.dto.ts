import { ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { StudentProfileDto } from './student-profile.dto';
import { StudentAddressDto } from './student-address.dto';
import { ParentDto } from './parent.dto';

export class CreateStudentAdmissionDto {
  @ValidateNested()
  @Type(() => StudentProfileDto)
  profile: StudentProfileDto;

  @ValidateNested({ each: true })
  @Type(() => StudentAddressDto)
  addresses: StudentAddressDto[];

  @ValidateNested()
  @Type(() => ParentDto)
  parent: ParentDto;

  @IsBoolean()
  autoInviteParentUser: boolean;
}
