import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Remote } from './remote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Remote])],
  exports: [TypeOrmModule]
})
export class UsersModule { }
