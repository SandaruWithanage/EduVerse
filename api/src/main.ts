// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Security Middleware
  app.use(helmet()); // HTTP security headers
  app.enableCors({
    origin: '*',  // For development — change in production!
    credentials: true,
  });

  // 2. Global Validation (DTO validation)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // remove unknown fields
      forbidNonWhitelisted: true, // block unknown fields
      transform: true,            // auto-convert types
    }),
  );

  // 3. Global API prefix
  app.setGlobalPrefix('api');

  // Start server
  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 EduVerse API running on http://localhost:${port}/api`);
}

bootstrap();
