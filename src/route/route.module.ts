import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from 'src/database/entities/route.entity';
import { RouteRepository } from 'src/database/entities/route.repository';
import { RouteService } from './route.service';

@Module({
  imports: [TypeOrmModule.forFeature([RouteRepository])],
  providers: [RouteService],
  exports: [TypeOrmModule]
})
export class RouteModule { }
