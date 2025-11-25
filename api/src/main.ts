import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ----------------------------------------------------------
  // 1. CRITICAL: Enable Shutdown Hooks
  // ----------------------------------------------------------
  // Required for Prisma to disconnect gracefully when you stop
  // the server (Ctrl+C). Prevents "too many clients" DB errors.
  app.enableShutdownHooks();

  // ----------------------------------------------------------
  // 2. Security & CORS
  // ----------------------------------------------------------
  app.use(helmet()); // Set security headers

  app.enableCors({
    // Allow env variable to override, otherwise default to open for dev
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // ----------------------------------------------------------
  // 3. Global Validation Pipe
  // ----------------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 🛡️ Strip properties not in DTO
      forbidNonWhitelisted: true, // 🛡️ Throw error if extra properties sent
      transform: true, // ✨ REQUIRED: Enables @Transform() in your DTOs

      // ✨ NEW: Quality of Life improvement
      // Automatically converts types (e.g. query param "limit=10" (string) -> 10 (number))
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ----------------------------------------------------------
  // 4. Global Exception Filter
  // ----------------------------------------------------------
  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(HttpAdapterHost), new ConsoleLogger()),
  );

  // ----------------------------------------------------------
  // 5. Configuration
  // ----------------------------------------------------------
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 EduVerse API running on http://localhost:${port}/api`);
}

bootstrap();