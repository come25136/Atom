import { HttpModule, Module } from '@nestjs/common'
import { RouterModule, Routes } from 'nest-router'

import { AgencyModule } from './modules/agency/agency.module'
import { AttributionModule } from './modules/attribution/attribution.module'
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
import { StopsModule } from './static/stops/stops.module'
import { TransferModule } from './modules/transfer/transfer.module'
import { TranslationModule } from './modules/translation/translation.module'
import { TripModule } from './modules/trip/trip.module'
import { TripService } from './modules/trip/trip.service'

const routes: Routes = [
  {
    path: '/remotes',
    module: RemoteModule,
    children: [
      {
        path: '/:remoteId',
        children: [
          {
            path: '/stops',
            module: StopModule,
          },
        ],
      },
    ],
  },
  {
    path: '/static',
    children: [
      {
        path: '/stops',
        children: [
          {
            path: '/nearby',
            module: StopsModule,
          },
        ],
      },
    ],
  },
]

@Module({
  imports: [
    RouterModule.forRoutes(routes), // setup the routes
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
    StopsModule,
  ], // as usual, nothing new
  providers: [
    GtfsStaticService,
    GtfsArchiveService,
    TripService,
    FareAttributeService,
    StopTimeService,
  ],
})
export class URLRouterModule {}
