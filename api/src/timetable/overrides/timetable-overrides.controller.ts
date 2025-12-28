import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { TimetableOverridesService } from "./timetable-overrides.service";
import { CreateTimetableOverrideDto } from "./dto/create-timetable-override.dto";
import { UpdateTimetableOverrideDto } from "./dto/update-timetable-override.dto";
import { OverrideQueryDto } from "./dto/override-query.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Controller("timetable/overrides")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimetableOverridesController {
  constructor(private readonly service: TimetableOverridesService) {}

  // ============================================================
  // ADMIN: Create override
  // ============================================================
  @Post()
  @Roles(UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  create(@Req() req, @Body() dto: CreateTimetableOverrideDto) {
    return this.service.createOverride(req.user.tenantId, req.user.id, dto);
  }

  // ============================================================
  // ADMIN: List overrides
  // ============================================================
  @Get()
  @Roles(UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  list(@Req() req, @Query() q: OverrideQueryDto) {
    return this.service.listOverrides(req.user.tenantId, q);
  }

  // ============================================================
  // ADMIN: Update override
  // ============================================================
  @Patch(":id")
  @Roles(UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  update(@Req() req, @Param("id") id: string, @Body() dto: UpdateTimetableOverrideDto) {
    return this.service.updateOverride(req.user.tenantId, id, req.user.id, dto);
  }

  // ============================================================
  // ADMIN: Soft delete override
  // ============================================================
  @Delete(":id")
  @Roles(UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  remove(@Req() req, @Param("id") id: string) {
    return this.service.deleteOverride(req.user.tenantId, id);
  }
}
