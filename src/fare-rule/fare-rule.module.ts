import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FareRuleRepository } from 'src/database/entities/fare_rule.repository'
import { FareRuleService } from './fare-rule.service'

@Module({
  imports: [TypeOrmModule.forFeature([FareRuleRepository])],
  providers: [FareRuleService],
  exports: [TypeOrmModule],
})
export class FareRuleModule {}
