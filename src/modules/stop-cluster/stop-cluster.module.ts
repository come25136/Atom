import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { RemoteModule } from '../remote/remote.module'
import { StopClusterRepository } from 'src/database/tables/stop-cluster/stop-cluster.repository'
import { StopClusterService } from './stop-cluster.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([StopClusterRepository]),
    forwardRef(() => RemoteModule),
  ],
  providers: [StopClusterService],
  controllers: [],
  exports: [TypeOrmModule, StopClusterService],
})
export class StopClusterModule {}
