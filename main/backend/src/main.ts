import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["log", "error", "warn", "debug", "verbose"],
  });

  const config = app.get(ConfigService);
  const apiPrefix = config.get<string>("API_PREFIX") || "api/v1";
  const port = config.get<number>("PORT") || 4000;
  const corsOrigins = (config.get<string>("CORS_ORIGINS") || "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  app.enableCors({
    origin: corsOrigins.includes("*") ? true : corsOrigins,
    credentials: true,
  });

  app.setGlobalPrefix(apiPrefix.replace(/^\/|\/$/g, ""));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port, "0.0.0.0");
  // eslint-disable-next-line no-console
  console.log(`Pavitram backend running on http://localhost:${port}/${apiPrefix}`);
}

bootstrap();
