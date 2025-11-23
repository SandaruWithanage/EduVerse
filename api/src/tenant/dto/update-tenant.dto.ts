// api/src/tenant/dto/update-tenant.dto.ts
import { PartialType } from '@nestjs/mapped-types'; // Make sure this lib is installed!
import { CreateTenantDto } from './create-tenant.dto';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {}