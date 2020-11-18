import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AttributionRepository } from 'src/database/entities/attribution.repository'
import { AttributionService } from './attribution.service'

@Module({
  imports: [TypeOrmModule.forFeature([AttributionRepository])],
  providers: [AttributionService],
  exports: [TypeOrmModule],
})
export class AttributionModule {}
