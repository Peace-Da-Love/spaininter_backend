import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

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
  });
  // Set global prefix
  app.setGlobalPrefix('api');
  // Set global validation pipe
  app.useGlobalPipes(new ValidationPipe());
  // Start the app
  await app.listen(PORT, () => {
    logger.log(`Server is running on port ${PORT}`);
  });
}
bootstrap();
