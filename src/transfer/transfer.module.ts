import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from 'src/database/entities/transfer.entity';
import { TransferRepository } from 'src/database/entities/transfer.repository';
import { TransferService } from './transfer.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransferRepository])],
  providers: [TransferService],
  exports: [TypeOrmModule]
})
export class TransferModule { }
