import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TransferRepository } from 'src/database/transfer/transfer.repository'
import { TransferService } from './transfer.service'

@Module({
  imports: [TypeOrmModule.forFeature([TransferRepository])],
  providers: [TransferService],
  exports: [TypeOrmModule],
})
export class TransferModule {}
