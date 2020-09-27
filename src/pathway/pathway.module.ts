import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pathway } from 'src/database/entities/pathway.entity';
import { PathwayRepository } from 'src/database/entities/pathway.repository';
import { PathwayService } from './pathway.service';

@Module({
  imports: [TypeOrmModule.forFeature([PathwayRepository])],
  providers: [PathwayService],
  exports: [TypeOrmModule]
})
export class PathwayModule { }
