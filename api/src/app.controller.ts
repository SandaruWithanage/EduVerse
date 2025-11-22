// src/app.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';

@Controller('api')
export class AppController {
  
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected() {
    return { message: 'You are authenticated!' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Get('admin-area')
  getAdminOnly() {
    return { message: 'Welcome SUPER_ADMIN!' };
  }

  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}


