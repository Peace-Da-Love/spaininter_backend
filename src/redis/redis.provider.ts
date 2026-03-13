import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: (config: ConfigService) => {
    const host = config.get<string>('REDIS_HOST') || '127.0.0.1';
    const port = Number(config.get<number>('REDIS_PORT') || 6379);
    const password = config.get<string>('REDIS_PASSWORD') || undefined;

    const client = new Redis({
      host,
      port,
      password,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    });

    client.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Redis error', err);
    });

    return client;
  },
  inject: [ConfigService],
};
