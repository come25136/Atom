import { BullModule } from '@nestjs/bull'
import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GraphQLModule } from '@nestjs/graphql'

import { ClientsModule, Transport } from '@nestjs/microservices'
import { EventsModule } from './modules/events/events.module'
import { URLRouterModule } from './router'

import TypeORMConfig from './ormconfig'
import { RemotesResolver } from './modules/graphql/resolvers/remote/remote.resolver'
import { GraphRemoteModule } from './modules/graphql/resolvers/remote/remote.module'
import { GraphStopModule } from './modules/graphql/resolvers/stop/stop.module'
import { GraphVehicleModule } from './modules/graphql/resolvers/vehicle/vehicle.module'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    TypeOrmModule.forRoot({
      ...TypeORMConfig,
      ...{
        autoLoadEntities: true,
      }
    }),
    GraphQLModule.forRoot({
      debug: true || process.env.NODE_ENV === 'development',
      playground: true,
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.graphql',
      formatError: error => {
        if (error.extensions.exception.status) error.extensions.code = error.extensions.exception.message.toUpperCase().replace(' ', '_')

        return error
      },
    }),
    GraphRemoteModule,
    GraphStopModule,
    GraphVehicleModule,
    URLRouterModule,
    EventsModule,
  ],
  providers: [AppService],
})
export class AppModule { }
