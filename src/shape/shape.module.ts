import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ShapeRepository } from 'src/database/entities/shape.repository'
import { ShapeService } from './shape.service'

@Module({
  imports: [TypeOrmModule.forFeature([ShapeRepository])],
  providers: [ShapeService],
  exports: [TypeOrmModule],
})
export class ShapeModule {}
