import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PathwayRepository } from 'src/database/tables/pathway/pathway.repository'
import { PathwayService } from './pathway.service'

@Module({
  imports: [TypeOrmModule.forFeature([PathwayRepository])],
  providers: [PathwayService],
  exports: [TypeOrmModule],
})
export class PathwayModule {}
