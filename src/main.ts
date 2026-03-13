import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('bootstrap');

  const PORT = process.env.PORT || 3000;
  const CLIENT_URLS = process.env.CLIENT_URLS || 'http://localhost:5173';

  const app = await NestFactory.create(AppModule);

  /* CORS */
  app.enableCors({
    origin: CLIENT_URLS.split(';'),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  /* Body size limits */
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  /* Global API prefix */
  app.setGlobalPrefix('api');

  /* GLOBAL VALIDATION */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            //  удаляет лишние поля
      forbidNonWhitelisted: true, //  ошибка при лишних полях
      transform: true,            //  приводит типы (timestamp → number)
    }),
  );

  /* Cookies */
  app.use(cookieParser());

  /* Static files */
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen(PORT, () => {
    logger.log(`Server is running on port ${PORT}`);
  });
}

bootstrap();
