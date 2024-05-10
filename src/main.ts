import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  // Initialize Logger
  const logger = new Logger('bootstrap');

  // Constants
  const PORT = process.env.PORT || 3000;
  const CLIENT_URLS = process.env.CLIENT_URLS || 'http://localhost:3000';

  // Create the app
  const app = await NestFactory.create(AppModule);
  // Enable CORS
  app.enableCors({
    origin: CLIENT_URLS.split(';'),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
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
  await app.listen(PORT, () => {
    logger.log(`Server is running on port ${PORT}`);
  });
}
bootstrap();
