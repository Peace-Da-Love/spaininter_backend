import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '../redis/redis.provider';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthHandoffService {
  private readonly AUTH_SESSION_TTL_SECONDS = 120;

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

  public async saveSession(sessionId: string, userId: number): Promise<void> {
    await this.redis.set(
      `auth:session:${sessionId}`,
      JSON.stringify({ userId }),
      'EX',
      this.AUTH_SESSION_TTL_SECONDS,
    );
  }

  public async consumeSession(sessionId: string): Promise<number | null> {
    const key = `auth:session:${sessionId}`;
    const raw = await this.redis.get(key);
    if (!raw) return null;

    await this.redis.del(key);

    try {
      const parsed = JSON.parse(raw) as { userId?: number };
      if (!parsed?.userId || Number.isNaN(Number(parsed.userId))) {
        return null;
      }
      return Number(parsed.userId);
    } catch {
      return null;
    }
  }

}
