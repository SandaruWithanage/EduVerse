// src/auth/auth.controller.ts
import { 
  Body, 
  Controller, 
  Post, 
  Get, 
  Ip,
  Headers,
  UnauthorizedException,   // ✅ FIXED
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';

import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============================================================
  // PUBLIC AUTH ROUTES
  // ============================================================

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    // 1. Validate credentials manually (logs success/failure)
    const user = await this.authService.validateUser(
      dto.email,
      dto.password,
      ip,
      userAgent,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Issue tokens + audit success inside the service
    return this.authService.loginValidatedUser(user, ip, userAgent);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.refreshToken);
  }

  // ============================================================
  // AUTHENTICATED USER
  // ============================================================
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return {
      message: 'You are authenticated!',
      user,
    };
  }

  // ============================================================
  // ADMIN ONLY
  // ============================================================
  @Get('admin-area')
  @Roles('SUPER_ADMIN')
  adminArea(@CurrentUser() user: any) {
    return {
      message: 'Welcome to the admin area!',
      user,
    };
  }

  // ============================================================
  // SCHOOL ADMIN ONLY
  // ============================================================
  @Get('school-admin-area')
  @Roles('SCHOOL_ADMIN') 
  // If you want super admin to also access:
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  schoolAdminArea(@CurrentUser() user: any) {
    return {
      message: 'Welcome SCHOOL_ADMIN to School Admin Area!',
      user,
    };
  }

}
