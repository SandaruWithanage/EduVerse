import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class BulkEnrollDto {
  @IsUUID()
  classId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  studentIds: string[];
}
