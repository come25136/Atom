import { AgencyRepository } from 'src/database/agency/agency.repository'
import { AgencyService } from './agency.service'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([AgencyRepository])],
  providers: [AgencyService],
  exports: [TypeOrmModule],
})
export class AgencyModule {}
