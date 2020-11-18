import { ConfigService } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AgencyModule } from 'src/agency/agency.module'
import { AgencyService } from 'src/agency/agency.service'
import { CalendarDateModule } from 'src/calendar-date/calendar-date.module'
import { CalendarDateService } from 'src/calendar-date/calendar-date.service'
import { CalendarModule } from 'src/calendar/calendar.module'
import { CalendarService } from 'src/calendar/calendar.service'
import { FareAttributeModule } from 'src/fare-attribute/fare-attribute.module'
import { FareAttributeService } from 'src/fare-attribute/fare-attribute.service'
import { FareRuleModule } from 'src/fare-rule/fare-rule.module'
import { FareRuleService } from 'src/fare-rule/fare-rule.service'
import { FeedInfoModule } from 'src/feed-info/feed-info.module'
import { FeedInfoService } from 'src/feed-info/feed-info.service'
import { FrequencyModule } from 'src/frequency/frequency.module'
import { FrequencyService } from 'src/frequency/frequency.service'
import { GtfsArchiveService } from 'src/gtfs-archive/gtfs-archive.service'
import { GtfsRealtimeModule } from 'src/gtfs-realtime/gtfs-realtime.module'
import { GtfsRealtimeService } from 'src/gtfs-realtime/gtfs-realtime.service'
import { GtfsStaticModule } from 'src/gtfs-static/gtfs-static.module'
import { GtfsStaticService } from 'src/gtfs-static/gtfs-static.service'
import { LevelModule } from 'src/level/level.module'
import { LevelService } from 'src/level/level.service'
import { PathwayModule } from 'src/pathway/pathway.module'
import { PathwayService } from 'src/pathway/pathway.service'
import { RemoteController } from './remote.controller'
import { RemoteRepository } from 'src/database/entities/remote.repository'
import { RemoteService } from './remote.service'
import { RouteModule } from 'src/route/route.module'
import { RouteService } from 'src/route/route.service'
import { ShapeModule } from 'src/shape/shape.module'
import { ShapeService } from 'src/shape/shape.service'
import { StopModule } from 'src/stop/stop.module'
import { StopService } from 'src/stop/stop.service'
import { StopTimeModule } from 'src/stop-time/stop-time.module'
import { StopTimeService } from 'src/stop-time/stop-time.service'
import { TransferModule } from 'src/transfer/transfer.module'
import { TransferService } from 'src/transfer/transfer.service'
import { TranslationModule } from 'src/translation/translation.module'
import { TranslationService } from 'src/translation/translation.service'
import { TripModule } from 'src/trip/trip.module'
import { TripService } from 'src/trip/trip.service'
import { AttributionModule } from 'src/attribution/attribution.module'
import { AttributionService } from 'src/attribution/attribution.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([RemoteRepository]),
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
