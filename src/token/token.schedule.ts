import { Injectable, Logger } from '@nestjs/common';
import { TokenService } from './token.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TokenScheduleService {
  constructor(
    private readonly logger: Logger,
    private readonly tokenService: TokenService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  public async deleteExpiredTokens() {
    this.logger.debug('Delete expired tokens');
    const count = await this.tokenService.deleteExpiredTokens();
    this.logger.debug(`Deleted ${count} expired tokens`);
  }
}
