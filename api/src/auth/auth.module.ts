// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { PrismaModule } from '../prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PrismaModule,

    // Default JWT strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT config (secret loaded in strategy)
    JwtModule.register({
      global: true,
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,

    // 👇 ORDER IS CRITICAL
    // 1. Global authentication (populates req.user)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // 2. Global authorization (checks req.user.role)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],

  exports: [AuthService],
})
export class AuthModule {}
