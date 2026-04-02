import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(process.env.PREFIX || 'api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.TRUSTED_ORIGINS?.split(',') || '*' });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🔧 Ferretería El Clavo API running on port ${port}`);
}
bootstrap();
