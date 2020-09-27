import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stop } from 'src/database/entities/stop.entity';
import { StopRepository } from 'src/database/entities/stop.repository';
import { StopService } from './stop.service';

@Module({
  imports: [TypeOrmModule.forFeature([StopRepository])],
  providers: [StopService],
  exports: [TypeOrmModule]
})
export class StopModule { }
