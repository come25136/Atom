import { Module } from '@nestjs/common'
import { RemoteModule } from 'src/modules/remote/remote.module'
import { StopModule } from 'src/modules/stop/stop.module'
import { StopsController } from './stops.controller'

@Module({
  imports: [RemoteModule, StopModule],
  controllers: [StopsController],
})
export class StopsModule {}
