import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FareAttributeRepository } from 'src/database/entities/fare_attribute.repository'
import { FareAttributeService } from './fare-attribute.service'

@Module({
  imports: [TypeOrmModule.forFeature([FareAttributeRepository])],
  providers: [FareAttributeService],
  exports: [TypeOrmModule],
})
export class FareAttributeModule {}
