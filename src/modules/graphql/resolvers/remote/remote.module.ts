import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GTFSContracts } from 'src/modules/remote/event.contract';
import { RemoteModule } from 'src/modules/remote/remote.module';
import { RemotesResolver } from './remote.resolver';


@Module({
  imports: [
    ClientsModule.register([
      {
        name: GTFSContracts.inject,
        transport: Transport.REDIS,
        options: {
          url:
            `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` ||
            'redis://redis:6379',
        },
      },
    ]),
    BullModule.registerQueue({
      name: GTFSContracts.inject,
    }),
    RemoteModule
  ],
  providers: [RemotesResolver],
  exports: [],
})
export class GraphRemoteModule { }
