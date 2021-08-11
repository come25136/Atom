import { Module } from '@nestjs/common'

import { RemoteModule } from 'src/modules/remote/remote.module';
import { StopClusterModule } from 'src/modules/stop-cluster/stop-cluster.module';
import { StopModule } from 'src/modules/stop/stop.module';

import { StopResolver } from './stop.resolver';

@Module({
  imports: [
    RemoteModule,
    StopModule,
    StopClusterModule,
  ],
  providers: [StopResolver],
  exports: [],
})
export class GraphStopModule { }
