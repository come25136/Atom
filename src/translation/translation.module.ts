import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Translation } from 'src/database/entities/translation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Translation])],
  exports: [TypeOrmModule]
})
export class TranslationModule { }
