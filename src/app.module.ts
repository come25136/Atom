import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AgencyModule } from './agency/agency.module'
import { CalendarDateModule } from './calendar-date/calendar-date.module'
import { CalendarModule } from './calendar/calendar.module'
import { FareAttributeModule } from './fare-attribute/fare-attribute.module'
import { FareAttributeService } from './fare-attribute/fare-attribute.service'
import { FareRuleModule } from './fare-rule/fare-rule.module'
import { FeedInfoModule } from './feed-info/feed-info.module'
import { FrequencyModule } from './frequency/frequency.module'
import { GtfsArchiveModule } from './gtfs-archive/gtfs-archive.module'
import { GtfsArchiveService } from './gtfs-archive/gtfs-archive.service'
import { GtfsRealtimeModule } from './gtfs-realtime/gtfs-realtime.module'
import { GtfsStaticModule } from './gtfs-static/gtfs-static.module'
import { GtfsStaticService } from './gtfs-static/gtfs-static.service'
import { LevelModule } from './level/level.module'
import { PathwayModule } from './pathway/pathway.module'
import { RemoteModule } from './remote/remote.module'
import { RouteModule } from './route/route.module'
import { ShapeModule } from './shape/shape.module'
import { StopModule } from './stop/stop.module'
import { StopTimeModule } from './stop-time/stop-time.module'
import { StopTimeService } from './stop-time/stop-time.service'
import { TransferModule } from './transfer/transfer.module'
import { TranslationModule } from './translation/translation.module'
import { TripModule } from './trip/trip.module'
import { TripService } from './trip/trip.service'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'atom_dev_nest',
      charset: 'utf8', // NOTE: Specified key was too long; max key length is 3072 bytes. に引っかかるので仕方なく...
      autoLoadEntities: true,
      synchronize: false,
      logging: false,
    }),
    RemoteModule,
    AgencyModule,
    TranslationModule,
    CalendarDateModule,
    CalendarModule,
    FareAttributeModule,
    FareRuleModule,
    FeedInfoModule,
    FrequencyModule,
    LevelModule,
    PathwayModule,
    RouteModule,
    ShapeModule,
    StopTimeModule,
    StopModule,
    TransferModule,
    TripModule,
    GtfsStaticModule,
    GtfsRealtimeModule,
    GtfsArchiveModule,
  ],
  controllers: [],
  providers: [
    GtfsStaticService,
    GtfsArchiveService,
    TripService,
    FareAttributeService,
    StopTimeService,
  ],
})
export class AppModule {}
