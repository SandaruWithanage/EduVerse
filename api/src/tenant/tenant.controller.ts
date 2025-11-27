import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Ip,
  Headers,
  ValidationPipe,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('tenants')
@Roles('SUPER_ADMIN')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  create(
    @Body() dto: CreateTenantDto,
    @CurrentUser() user: any,
    @Ip() ip: string,
    @Headers('user-agent') agent: string,
  ) {
    return this.tenantService.create(dto, user, ip, agent);
  }

  @Get()
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Ip() ip: string,
    @Headers('user-agent') agent: string,
  ) {
    return this.tenantService.findOne(id, user, ip, agent);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    // 🛡️ SECURE VERSION: We keep whitelist: true to prevent hacking
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true, // <--- KEEPS SECURITY ON
        forbidNonWhitelisted: true, // <--- Enforces schema
        skipMissingProperties: false, // PartialType adds @IsOptional, so this can be false
      }),
    )
    dto: UpdateTenantDto,
    @CurrentUser() user: any,
    @Ip() ip: string,
    @Headers('user-agent') agent: string,
  ) {
    return this.tenantService.update(id, dto, user, ip, agent);
  }
}
