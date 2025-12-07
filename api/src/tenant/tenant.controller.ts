import { Controller, Post, Body, Req, UseGuards, Ip, Headers } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/types'; // Import the new type

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  create(
    @Body() createTenantDto: CreateTenantDto,
    @Req() req: AuthenticatedRequest,
    @Ip() ip: string,
    @Headers('user-agent') agent: string,
  ) {
    // Now TypeScript knows that req.user has a tenantId
    return this.tenantService.create(createTenantDto, req.user, ip, agent);
  }
}
