import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const jwtSecret = process.env.JWT_SECRET || '';
  if (
    process.env.NODE_ENV === 'production' &&
    (jwtSecret.length < 32 || jwtSecret.startsWith('REPLACE_') || jwtSecret === 'dev_secret_change_me')
  ) {
    // eslint-disable-next-line no-console
    console.error(
      '[SECURITY] JWT_SECRET is missing, too short, or still a placeholder. Anyone can forge login tokens. ' +
        'Set a real value (openssl rand -hex 32) in the VPS .env and redeploy.',
    );
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: false });

  // Behind nginx (and the Next.js proxy) every request would otherwise look like it comes from one IP,
  // making the 120 req/min rate limit shared by ALL users. One trusted hop: the proxy right in front of us
  // (nginx directly, or the Next.js container, which forwards nginx's X-Forwarded-For unchanged).
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 1));

  app.use(helmet());

  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('JobConnect API')
    .setDescription(
      'Job portal backend. Signup/login are proxied to the Pavitram Central Auth API; ' +
        'roles and profiles are owned by this service.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`JobPortal backend running on http://localhost:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
