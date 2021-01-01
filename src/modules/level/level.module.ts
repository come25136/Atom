import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { LevelRepository } from 'src/database/tables/level/level.repository'
import { LevelService } from './level.service'

@Module({
  imports: [TypeOrmModule.forFeature([LevelRepository])],
  providers: [LevelService],
  exports: [TypeOrmModule],
})
export class LevelModule {}
