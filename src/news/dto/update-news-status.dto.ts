import { IsIn, IsNotEmpty } from 'class-validator';
import { NewsStatus } from '../news.model';

export class UpdateNewsStatusDto {
  @IsNotEmpty()
  @IsIn(['pending', 'approved', 'rejected'])
  status: NewsStatus;
}
