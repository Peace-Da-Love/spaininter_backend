import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  // Initialize Logger
  const logger = new Logger('bootstrap');

  // Constants
  const PORT = process.env.PORT || 3000;
  const CLIENT_URLS = process.env.CLIENT_URLS || 'http://localhost:5173';

  // Create the app
  const app = await NestFactory.create(AppModule);
  // Enable CORS
  app.enableCors({
    origin: CLIENT_URLS.split(';'),
    // origin: '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
  console.log('CLIENT_URLS:', CLIENT_URLS);

  // Set `http request size
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  // Set global prefix
  app.setGlobalPrefix('api');
  // Set global validation pipe
  app.useGlobalPipes(new ValidationPipe());
  // Use cookie parser
  app.use(cookieParser());
  // Start the app
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  await app.listen(PORT, () => {
    logger.log(`Server is running on port ${PORT}`);
  });
}
bootstrap();
