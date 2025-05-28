import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { City } from './cities.entity';

@Module({
  imports: [SequelizeModule.forFeature([City])],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}