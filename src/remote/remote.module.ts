import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Remote } from '../database/entities/remote.entity';
import { RemoteController } from './remote.controller';
import { RemoteService } from './remote.service';

@Module({
  imports: [TypeOrmModule.forFeature([Remote])],
  providers: [RemoteService],
  controllers: [RemoteController],
  exports: [TypeOrmModule]
})
export class RemoteModule { }
