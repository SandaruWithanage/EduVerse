// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Get,
  Ip,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { ActivateAccountDto } from './activate-account.dto';

import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============================================================
  // PUBLIC AUTH ROUTES
  // ============================================================

  /**
   * Login with email + password
   */
  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const user = await this.authService.validateUser(
      dto.email,
      dto.password,
      ip,
      userAgent,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.loginValidatedUser(user, ip, userAgent);
  }

  /**
   * Refresh access + refresh tokens
   */
  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  /**
   * Logout (invalidate refresh tokens)
   */
  @Public()
  @Post('logout')
  logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.refreshToken);
  }

  /**
   * Activate invited account (Parent invite flow)
   */
  @Public()
  @Post('activate')
  activateAccount(@Body() dto: ActivateAccountDto) {
    return this.authService.activateAccount(dto);
  }

  // ============================================================
  // AUTHENTICATED USER ROUTES
  // ============================================================

  /**
   * Get current authenticated user
   */
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return {
      message: 'You are authenticated!',
      user,
    };
  }

  // ============================================================
  // ROLE-BASED ROUTES
  // ============================================================

  /**
   * SUPER_ADMIN only
   */
  @Get('admin-area')
  @Roles('SUPER_ADMIN')
  adminArea(@CurrentUser() user: any) {
    return {
      message: 'Welcome to the admin area!',
      user,
    };
  }

  /**
   * SCHOOL_ADMIN (+ SUPER_ADMIN)
   */
  @Get('school-admin-area')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  schoolAdminArea(@CurrentUser() user: any) {
    return {
      message: 'Welcome to School Admin Area!',
      user,
    };
  }
}
