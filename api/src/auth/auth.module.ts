import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from '../prisma.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

import { PasswordService } from './password.service';
import { InviteMailerService } from './invite-mailer.service';
import { InviteCronService } from './invite-cron.service';

@Module({
  imports: [
    PrismaModule,

    // Passport JWT strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT module (secrets loaded in JwtStrategy)
    JwtModule.register({
      global: true,
    }),
  ],

  controllers: [AuthController],

  providers: [
    // Core services
    AuthService,
    PasswordService,

    // JWT
    JwtStrategy,

    // Invite system
    InviteMailerService,
    InviteCronService,

    // =========================
    // GLOBAL SECURITY GUARDS
    // =========================

    // 1️⃣ Authentication guard (sets req.user)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // 2️⃣ Authorization guard (checks roles)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],

  exports: [
    // Exported for other modules (Students, Users, etc.)
    AuthService,
    PasswordService,
    InviteMailerService,
  ],
})
export class AuthModule {}
