import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '../redis/redis.provider';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthHandoffService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  public async create(userId: number): Promise<string> {
    const token = uuidv4();
    const key = `auth:handoff:${token}`;
    await this.redis.set(key, String(userId), 'EX', 60, 'NX');
    return token;
  }

  public async consume(token: string): Promise<number | null> {
    const key = `auth:handoff:${token}`;
    const raw = await this.redis.get(key);
    if (!raw) return null;
    await this.redis.del(key);
    const id = parseInt(raw, 10);
    if (Number.isNaN(id)) return null;
    return id;
  }
}
