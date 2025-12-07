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
  // We allow the frontend URL defined in .env, or localhost for development
  const whitelist = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000'];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`Blocked CORS request from: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies/auth headers
  });

  // 3. Global Validation Pipe (Strict Mode)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Strip properties not in the DTO
      forbidNonWhitelisted: true, // Throw error if extra properties are sent
      transform: true,            // Auto-transform payloads to DTO instances
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
