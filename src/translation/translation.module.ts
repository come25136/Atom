import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TranslationRepository } from 'src/database/entities/translation.repository'
import { TranslationService } from './translation.service'

@Module({
  imports: [TypeOrmModule.forFeature([TranslationRepository])],
  exports: [TypeOrmModule],
  providers: [TranslationService],
})
export class TranslationModule {}
