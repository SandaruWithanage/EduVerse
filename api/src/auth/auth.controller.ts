// src/auth/auth.controller.ts
import { 
  Body, 
  Controller, 
  Post, 
  Get,      
  UseGuards
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: any) {
    return {
      message: 'You are authenticated!',
      user,
    };
  }

  // ------------------ ADMIN ONLY ------------------
  @Get('admin-area')
  @UseGuards(JwtAuthGuard, RolesGuard) // ⬅ IMPORTANT FIX
  @Roles('SUPER_ADMIN')
  adminArea(@CurrentUser() user: any) {
    return {
      message: 'Welcome to the admin area!',
      user,
    };
  }
}
