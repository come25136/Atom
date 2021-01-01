import { ConfigModule } from '@nestjs/config'
import { HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AgencyModule } from './modules/agency/agency.module'
import { CalendarDateModule } from './modules/calendar-date/calendar-date.module'
import { CalendarModule } from './modules/calendar/calendar.module'
import { FareAttributeModule } from './modules/fare-attribute/fare-attribute.module'
import { FareAttributeService } from './modules/fare-attribute/fare-attribute.service'
import { FareRuleModule } from './modules/fare-rule/fare-rule.module'
import { FeedInfoModule } from './modules/feed-info/feed-info.module'
import { FrequencyModule } from './modules/frequency/frequency.module'
import { GtfsArchiveModule } from './modules/gtfs-archive/gtfs-archive.module'
import { GtfsArchiveService } from './modules/gtfs-archive/gtfs-archive.service'
import { GtfsRealtimeModule } from './modules/gtfs-realtime/gtfs-realtime.module'
import { GtfsStaticModule } from './modules/gtfs-static/gtfs-static.module'
import { GtfsStaticService } from './modules/gtfs-static/gtfs-static.service'
import { LevelModule } from './modules/level/level.module'
import { PathwayModule } from './modules/pathway/pathway.module'
import { RemoteModule } from './modules/remote/remote.module'
import { RouteModule } from './modules/route/route.module'
import { ShapeModule } from './modules/shape/shape.module'
import { StopModule } from './modules/stop/stop.module'
import { StopTimeModule } from './modules/stop-time/stop-time.module'
import { StopTimeService } from './modules/stop-time/stop-time.service'
import { TransferModule } from './modules/transfer/transfer.module'
import { TranslationModule } from './modules/translation/translation.module'
import { TripModule } from './modules/trip/trip.module'
import { TripService } from './modules/trip/trip.service'
import { AttributionModule } from './modules/attribution/attribution.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'atom_dev_nest',
      charset: 'utf8', // NOTE: Specified key was too long; max key length is 3072 bytes. に引っかかるので仕方なく...
      autoLoadEntities: true,
      synchronize: false,
      logging: true,
    }),
    HttpModule,
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
    AttributionModule,
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
export class AppModule { }
