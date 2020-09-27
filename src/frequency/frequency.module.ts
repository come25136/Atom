import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Frequency } from 'src/database/entities/frequency.entity';
import { FrequencyRepository } from 'src/database/entities/frequency.repository';
import { FrequencyService } from './frequency.service';

@Module({
  imports: [TypeOrmModule.forFeature([FrequencyRepository])],
  providers: [FrequencyService],
  exports: [TypeOrmModule]
})
export class FrequencyModule { }
