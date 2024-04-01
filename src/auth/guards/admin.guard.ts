import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IRole } from '../../token/types/IPayload';

@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  handleRequest(err, data) {
    if (err || !data) {
      throw err || new UnauthorizedException();
    }
    const role = data.role as IRole;
    if (role !== 'superadmin') {
      throw new HttpException('Forbidden', 403);
    }
    return data;
  }
}
