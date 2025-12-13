import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Security Headers (Helmet)
  app.use(helmet());

  // 2. Secure CORS Configuration
  const whitelist = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (whitelist.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Blocked CORS request from: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. ✅ Global Validation Pipe (FIXED)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // ✅ REQUIRED
      transformOptions: {
        enableImplicitConversion: true, // ✅ REQUIRED (Date string → Date)
      },
    }),
  );

  // 4. Global Exception Filter
  const httpAdapterHost = app.get(HttpAdapterHost);
  const logger = new ConsoleLogger();
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger));

  await app.listen(process.env.PORT ?? 4000);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}

bootstrap();
