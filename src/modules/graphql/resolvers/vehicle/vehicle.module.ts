import { Module } from '@nestjs/common'
import { IOModule } from 'nestjs-graphql-redis-subscriptions';

import { RemoteModule } from 'src/modules/remote/remote.module';

import { VehicleResolver } from './vehicle.resolver';

@Module({
  imports: [
    RemoteModule,
    IOModule.registerRedisPubSub(
      // publisher connection
      {
        useFactory: () => ({
          port: 6379,
          host: "127.0.0.1",
        }),
      },
      // subscriber connection
      {
        useFactory: () => ({
          port: 6379,
          host: "127.0.0.1",
        }),
      }
    )
  ],
  providers: [VehicleResolver,],
  exports: [],
})
export class GraphVehicleModule { }
