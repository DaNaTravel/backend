import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './config/logger';
import { HOST, PORT } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors();
  await app.listen(PORT);

  const logger = new Logger('DaNaTravel');
  logger.log(`Application is running on http://${HOST}:${PORT}`);
}
bootstrap();
