import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HOST, PORT } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(PORT);

  const logger = new Logger('DaNaTravel');
  logger.log(`Application is running on http://${HOST}:${PORT}`);
}
bootstrap();
