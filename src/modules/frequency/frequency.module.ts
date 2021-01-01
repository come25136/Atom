import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FrequencyRepository } from 'src/database/tables/frequency/frequency.repository'
import { FrequencyService } from './frequency.service'

@Module({
  imports: [TypeOrmModule.forFeature([FrequencyRepository])],
  providers: [FrequencyService],
  exports: [TypeOrmModule],
})
export class FrequencyModule {}
