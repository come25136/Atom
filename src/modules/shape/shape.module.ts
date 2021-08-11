import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ShapeRepository } from 'src/database/tables/shape/shape.repository'
import { ShapeService } from './shape.service'

@Module({
  imports: [TypeOrmModule.forFeature([ShapeRepository])],
  providers: [ShapeService],
  exports: [TypeOrmModule, ShapeService],
})
export class ShapeModule {}
