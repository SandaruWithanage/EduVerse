import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
//import { RlsInterceptor } from './common/interceptors/rls.interceptor';
import { TenantModule } from './tenant/tenant.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; 
import { RolesGuard } from './auth/guards/roles.guard';      
import { SubjectsModule } from './subjects/subjects.module';
import { ClsModule } from 'nestjs-cls'; // <--- Import ClsModule

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true }, // Automatically mount middleware for all routes
      }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    // 1. SECURITY: Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    AuthModule,
    AuditModule,
    TenantModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    SubjectsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 2. SECURITY: Global Rate Limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // 3. SECURITY: Global Authentication (Token required everywhere)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 4. SECURITY: Global RBAC (Roles check)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // 5. SECURITY: Enable RLS (Multi-tenancy)
    /*{
      provide: APP_INTERCEPTOR,
      useClass: RlsInterceptor,
    },*/
  ],
})
export class AppModule {}