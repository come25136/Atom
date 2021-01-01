import { ConfigService } from '@nestjs/config'
import { HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AgencyModule } from 'src/modules/agency/agency.module'
import { AgencyService } from 'src/modules/agency/agency.service'
import { CalendarDateModule } from 'src/modules/calendar-date/calendar-date.module'
import { CalendarDateService } from 'src/modules/calendar-date/calendar-date.service'
import { CalendarModule } from 'src/modules/calendar/calendar.module'
import { CalendarService } from 'src/modules/calendar/calendar.service'
import { FareAttributeModule } from 'src/modules/fare-attribute/fare-attribute.module'
import { FareAttributeService } from 'src/modules/fare-attribute/fare-attribute.service'
import { FareRuleModule } from 'src/modules/fare-rule/fare-rule.module'
import { FareRuleService } from 'src/modules/fare-rule/fare-rule.service'
import { FeedInfoModule } from 'src/modules/feed-info/feed-info.module'
import { FeedInfoService } from 'src/modules/feed-info/feed-info.service'
import { FrequencyModule } from 'src/modules/frequency/frequency.module'
import { FrequencyService } from 'src/modules/frequency/frequency.service'
import { GtfsArchiveService } from 'src/modules/gtfs-archive/gtfs-archive.service'
import { GtfsRealtimeModule } from 'src/modules/gtfs-realtime/gtfs-realtime.module'
import { GtfsRealtimeService } from 'src/modules/gtfs-realtime/gtfs-realtime.service'
import { GtfsStaticModule } from 'src/modules/gtfs-static/gtfs-static.module'
import { GtfsStaticService } from 'src/modules/gtfs-static/gtfs-static.service'
import { LevelModule } from 'src/modules/level/level.module'
import { LevelService } from 'src/modules/level/level.service'
import { PathwayModule } from 'src/modules/pathway/pathway.module'
import { PathwayService } from 'src/modules/pathway/pathway.service'
import { RemoteController } from './remote.controller'
import { RemoteRepository } from 'src/database/remote/remote.repository'
import { RemoteService } from './remote.service'
import { RouteModule } from 'src/modules/route/route.module'
import { RouteService } from 'src/modules/route/route.service'
import { ShapeModule } from 'src/modules/shape/shape.module'
import { ShapeService } from 'src/modules/shape/shape.service'
import { StopModule } from 'src/modules/stop/stop.module'
import { StopService } from 'src/modules/stop/stop.service'
import { StopTimeModule } from 'src/modules/stop-time/stop-time.module'
import { StopTimeService } from 'src/modules/stop-time/stop-time.service'
import { TransferModule } from 'src/modules/transfer/transfer.module'
import { TransferService } from 'src/modules/transfer/transfer.service'
import { TranslationModule } from 'src/modules/translation/translation.module'
import { TranslationService } from 'src/modules/translation/translation.service'
import { TripModule } from 'src/modules/trip/trip.module'
import { TripService } from 'src/modules/trip/trip.service'
import { AttributionModule } from 'src/modules/attribution/attribution.module'
import { AttributionService } from 'src/modules/attribution/attribution.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([RemoteRepository]),
    HttpModule,
    GtfsStaticModule,
    GtfsRealtimeModule,
    AgencyModule,
    StopModule,
    RouteModule,
    TripModule,
    StopTimeModule,
    CalendarModule,
    CalendarDateModule,
    FareAttributeModule,
    FareRuleModule,
    ShapeModule,
    FrequencyModule,
    TransferModule,
    PathwayModule,
    LevelModule,
    FeedInfoModule,
    TranslationModule,
    AttributionModule,
  ],
  providers: [
    ConfigService,
    RemoteService,
    GtfsArchiveService,
    GtfsStaticService,
    GtfsRealtimeService,
    AgencyService,
    StopService,
    RouteService,
    TripService,
    StopTimeService,
    CalendarService,
    CalendarDateService,
    FareAttributeService,
    FareRuleService,
    ShapeService,
    FrequencyService,
    TransferService,
    PathwayService,
    LevelService,
    FeedInfoService,
    TranslationService,
    AttributionService,
  ],
  controllers: [RemoteController],
  exports: [TypeOrmModule],
})
export class RemoteModule {}
