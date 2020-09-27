import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from 'src/database/entities/level.entity';
import { LevelRepository } from 'src/database/entities/level.repository';
import { LevelService } from './level.service';

@Module({
  imports: [TypeOrmModule.forFeature([LevelRepository])],
  providers: [LevelService],
  exports: [TypeOrmModule]
})
export class LevelModule { }
