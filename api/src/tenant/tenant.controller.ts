import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Ip,
  Headers,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/types';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  // ✅ CREATE TENANT (SUPER_ADMIN)
  @Post()
  create(
    @Body() dto: CreateTenantDto,
    @Req() req: AuthenticatedRequest,
    @Ip() ip: string,
    @Headers('user-agent') agent: string,
  ) {
    return this.tenantService.create(dto, req.user, ip, agent);
  }

  // ✅ LIST ALL TENANTS (SUPER_ADMIN)
  @Get()
  findAll() {
    return this.tenantService.findAll();
  }

  // ✅ GET SINGLE TENANT (SUPER_ADMIN)
 @Get(':id')
findOne(@Param('id') id: string) {
  return this.tenantService.findOne(id);
}

}
