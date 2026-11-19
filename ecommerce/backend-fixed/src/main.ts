import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const prefix = config.get<string>('API_PREFIX') || 'api';
  app.setGlobalPrefix(prefix);

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN') || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pavitram API')
    .setDescription('Complete B2C + B2B e-commerce backend — every resource used by the Pavitram frontend, full CRUD.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document);

  const port = config.get<number>('PORT') || 4006;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Pavitram backend running on http://localhost:${port}/${prefix}`);
  // eslint-disable-next-line no-console
  console.log(`📘 Swagger docs at http://localhost:${port}/${prefix}/docs`);
}
bootstrap();
