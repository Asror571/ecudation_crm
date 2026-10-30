import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './config/env.validation';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config =
    app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: config.get('FRONTEND_URL', { infer: true }),
    credentials: true,
  });
  app.enableShutdownHooks();

  const port = config.get('PORT', { infer: true });
  await app.listen(port, '0.0.0.0');

  Logger.log(
    `Education CRM API is running on http://localhost:${port}/api`,
    'Bootstrap',
  );
}

bootstrap().catch((error: unknown) => {
  Logger.error('Failed to start application', error, 'Bootstrap');
  process.exit(1);
});
