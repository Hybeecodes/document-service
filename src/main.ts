import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as helmet from 'helmet';
import * as compression from 'compression';
// import * as rateLimit from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from './utils/validator.pipe';

const SERVICE_NAME = 'file-service';

const logger = new Logger('Bootstrap');

const config = new ConfigService();
const port = config.get<string>('PORT') || 8081;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(`/api/${SERVICE_NAME}/v1`);
  // app.use(`/api/${SERVICE_NAME}/v1/some_route`, limiter); // limit number of requests for certain endpoints (comment out or remove if unnecessary)
  app.use(helmet());
  app.enableCors();
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port);
  logger.log(`Server running on PORT ${port}`);
}
bootstrap();
