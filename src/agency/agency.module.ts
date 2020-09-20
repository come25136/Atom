import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agency } from 'src/database/entities/agency.entity';
import { AgencyService } from './agency.service';

@Module({
  imports: [TypeOrmModule.forFeature([Agency])],
  providers: [AgencyService],
  exports: [TypeOrmModule]
})
export class AgencyModule { }
