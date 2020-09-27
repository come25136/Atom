import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyRepository } from 'src/database/entities/agency.repository';
import { AgencyService } from './agency.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgencyRepository])],
  providers: [AgencyService],
  exports: [TypeOrmModule]
})
export class AgencyModule { }
