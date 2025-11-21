// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { PrismaModule } from '../prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PrismaModule,

    // Passport must be registered for jwt guard to work
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JwtModule: make available everywhere, but DO NOT define secrets here
    JwtModule.register({
      global: true,
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,  
  ],

  exports: [AuthService],
})
export class AuthModule {}
