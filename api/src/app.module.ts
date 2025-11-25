import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { RlsInterceptor } from './common/interceptors/rls.interceptor';
import { TenantModule } from './tenant/tenant.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    // 1. SECURITY: Enable Rate Limiting (10 requests per 60 seconds)
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    PrismaModule,
    AuthModule,
    AuditModule,
    TenantModule,
    UsersModule,
    StudentsModule,
    TeachersModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 2. SECURITY: Enable Global Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // 3. SECURITY: Enable RLS (Multi-tenancy)
    { 
      provide: APP_INTERCEPTOR, 
      useClass: RlsInterceptor 
    },
  ],
})
export class AppModule {}