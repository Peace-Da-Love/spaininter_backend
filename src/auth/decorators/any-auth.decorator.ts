import { applyDecorators, UseGuards } from '@nestjs/common';
import { AnyAuthGuard } from '../guards/any-auth.guard';

export function AnyAuth() {
  return applyDecorators(UseGuards(AnyAuthGuard));
}
