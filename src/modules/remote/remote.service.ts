import * as GTFS from '@come25136/gtfs'
import * as Supercluster from 'supercluster';
import * as _ from 'lodash'
import * as dayjs from 'dayjs'
import * as del from 'del'
import * as fastCsv from 'fast-csv'
import * as geolib from 'geolib'
import * as moment from 'moment'
import * as path from 'path'
import {
  BadRequestException,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { In } from 'typeorm'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { Transactional } from 'typeorm-transactional-cls-hooked'
import { promises as fs } from 'fs'
import * as GeoHash from 'ngeohash'

import { CrawlStatus, Remote } from 'src/database/tables/remote/remote.entity'
import {
  FeedType,
  GtfsRealtime,
} from 'src/database/tables/gtfs-realtime/gtfs_realtime.entity'
import {
  FindRemoteDto,
  RegistrationRemoteDto,
  StatusResult,
} from 'src/modules/interfaces/remote.dto'
import {
  ISO4217,
  ModeDecoratores,
  closestPoint,
  convertStringFullWidthToHalfWidth,
} from 'src/util'
import { AgencyService } from 'src/modules/agency/agency.service'
import { AttributionService } from 'src/modules/attribution/attribution.service'
import { CalendarDateService } from 'src/modules/calendar-date/calendar-date.service'
import { CalendarService } from 'src/modules/calendar/calendar.service'
import { FareAttributeService } from 'src/modules/fare-attribute/fare-attribute.service'
import { FareRuleService } from 'src/modules/fare-rule/fare-rule.service'
import { FeedInfoService } from 'src/modules/feed-info/feed-info.service'
import { FrequencyService } from 'src/modules/frequency/frequency.service'
import { GtfsArchiveService } from 'src/modules/gtfs-archive/gtfs-archive.service'
import { GtfsRealtimeService } from 'src/modules/gtfs-realtime/gtfs-realtime.service'
import { GtfsStaticService } from 'src/modules/gtfs-static/gtfs-static.service'
import { LevelService } from 'src/modules/level/level.service'
import { PathwayService } from 'src/modules/pathway/pathway.service'
import { RemoteRepository } from 'src/database/tables/remote/remote.repository'
import { RouteService } from 'src/modules/route/route.service'
import { ShapeService } from 'src/modules/shape/shape.service'
import { StopService } from 'src/modules/stop/stop.service'
import { StopTimeService } from 'src/modules/stop-time/stop-time.service'
import { TableName } from 'src/database/tables/translation/translation.entity'
import { TransferService } from 'src/modules/transfer/transfer.service'
import { TranslationService } from 'src/modules/translation/translation.service'
import { TripService } from 'src/modules/trip/trip.service'

import GTFSInterface from '../interfaces/gtfs'
import { Shape } from 'src/database/tables/shape/shape.entity'

import { GTFSContracts } from './event.contract'
import { StopClusterService } from '../stop-cluster/stop-cluster.service';
import { Stop } from 'src/database/tables/stop/stop.entity';
import { Remote as RemoteModel } from '../graphql/schemas/remote.schema';
import * as cliProgress from 'cli-progress';

const GEO_R = 6378137;
const orgX = -1 * (2 * GEO_R * Math.PI / 2);
const orgY = (2 * GEO_R * Math.PI / 2);

const degrees2meters = function (zoomLevel: number, lat: number, lon: number) {
  const unit = 2 * GEO_R * Math.PI / Math.pow(2, zoomLevel)
  const x = lon * 20037508.34 / 180.0;
  const y = Math.log(Math.tan((90.0 + lat) * Math.PI / 360.0)) / (Math.PI / 180.0) * 20037508.34 / 180.0;
  return {
    lat: Math.floor((orgY - y) / unit),
    lon: Math.floor((x - orgX) / unit),
  }
}

function pixelOnTileToLatLon(tileZ: number, tileX: number, tileY: number, pX = 0, pY = 0) {
  const L = Math.asin(Math.tanh(Math.PI)) * 180 / Math.PI;
  // Pixel coordinate
  const x = 256 * tileX + pX;
  const y = 256 * tileY + pY;

  const lon = 180 * (x / (1 << (tileZ + 7)) - 1);
  const lat = (180 / Math.PI) * Math.asin(Math.tanh(- Math.PI / (1 << (tileZ + 7)) * y + Math.atanh(Math.sin(L * Math.PI / 180))));
  return { lat, lon };
}

@Injectable()
export class RemoteService implements OnApplicationBootstrap {
  constructor(
    private configService: ConfigService,
    private remoteRepository: RemoteRepository,
    private gtfsArchiveService: GtfsArchiveService,
    private gtfsStaticService: GtfsStaticService,
    private gtfsRTService: GtfsRealtimeService,
    private agencyService: AgencyService,
    private stopService: StopService,
    private routeService: RouteService,
    private tripService: TripService,
    private stopTimeService: StopTimeService,
    private calendarService: CalendarService,
    private calendarDateService: CalendarDateService,
    private fareAttributeService: FareAttributeService,
    private fareRuleService: FareRuleService,
    private shapeService: ShapeService,
    private frequencyService: FrequencyService,
    private transferService: TransferService,
    private pathwayService: PathwayService,
    private levelService: LevelService,
    private feedInfoService: FeedInfoService,
    private translationService: TranslationService,
    private attributionService: AttributionService,
    private stopClusterService: StopClusterService,
    @InjectQueue(GTFSContracts.inject) private readonly gtfsQueue: Queue,
  ) { }

  // NOTE: 依存すればするほど数字を大きくする
  private static readonly importProcessingOrder = {
    'agency.txt': 0,
    'stops.txt': 1, // NOTE: levelsに依存
    'routes.txt': 1, // NOTE: agencyに依存
    'trips.txt': 2, // NOTE: route, calendar(_dates)に依存
    'stop_times.txt': 3, // NOTE: trips, stopsに依存
    'calendar.txt': 0,
    'calendar_dates.txt': 0,
    'fare_attributes.txt': 1, // NOTE: agencyに依存
    'fare_rules.txt': 2, // NOTE: fare_attributes, routes, stopsに依存
    'shapes.txt': 3, // NOTE: データ量的にtripsより先にインサートする方が良い
    'frequencies.txt': 3, // NOTE: tripsに依存
    'transfers.txt': 1, // NOTE: stopsに依存
    'pathways.txt': 1, // NOTE: stopsに依存
    'levels.txt': 0,
    'feed_info.txt': 0,
    'translations.txt': 0, // NOTE: 変に紐付けるより後で全検索する方が綺麗
    'attributions.txt': 3, // NOTE: agency, routes, tripsに依存
  } as const

  @Transactional()
  async onApplicationBootstrap() {
    const remotes = await this.remoteRepository.find({
      relations: ['agencies'],
      where: { crawlStatus: CrawlStatus.IMPORTING },
    })

    remotes.forEach(remote => {
      if (remote.agencies.length === 0) {
        remote.crawlStatus = CrawlStatus.INITING
      } else {
        remote.crawlStatus = CrawlStatus.PENDING
      }
    })

    await this.remoteRepository.save(remotes)

    await Promise.all(
      remotes.map(async remote => {
        await this.gtfsQueue.add(GTFSContracts.import, remote.uid)
      }),
    )
  }

  @Transactional()
  private async insert(remoteEntity: Remote, fileName: string) {
    const date = dayjs() // TODO: 外に出す

    switch (fileName) {
      case GTFSInterface.StaticFileNames.Agency:
        const agencyEntities = this.bulkBuffer.map(row => {
          const e = this.agencyService.create(remoteEntity.uid, {
            id: row.agency_id || null,
            name: row.agency_name,
            url: row.agency_url,
            timezone: row.agency_timezone,
            lang: row.agency_lang || null,
            phone: row.agency_phone || null,
            fareUrl: row.agency_fare_url || null,
            email: row.agency_email || null,
          })
          e.remote = remoteEntity
          e.updatedAt = date

          return e
        })

        await this.agencyService.bulkUpsert(agencyEntities, true)

        for (const e of agencyEntities) {
          // console.log('this.routeService.linkAgency')
          this.routeService.linkAgency(remoteEntity.uid, e.uid, e.id)

          // console.log('this.fareAttributeService.linkAgency')
          this.fareAttributeService.linkAgency(remoteEntity.uid, e.uid, e.id)

          // console.log('this.attributionService.linkAgency')
          this.attributionService.linkAgency(remoteEntity.uid, e.uid, e.id)
        }

        break

      case GTFSInterface.StaticFileNames.Stops:
        const stopEntities = this.bulkBuffer.map(row => {
          const locationType = Number(row.location_type || 0)
          const wheelchairBoarding = Number(row.wheelchair_boarding || 0)

          if ([0, 1, 2].includes(locationType) === false)
            throw new BadRequestException(
              `Can not use '${locationType}' for location_type.`,
            )
          if ([0, 1, 2].includes(wheelchairBoarding) === false)
            throw new BadRequestException(
              `Can not use '${wheelchairBoarding}' for wheelchair_boarding.`,
            )

          const e = this.stopService.create(remoteEntity.uid, {
            id: row.stop_id,
            code: row.code,
            name: row.stop_name,
            description: row.description,
            location: {
              type: locationType as GTFS.Stop['location']['type'],
              lat: Number(row.stop_lat),
              lon: Number(row.stop_lon),
            },
            zone: {
              id: row.zone_id,
            },
            url: row.stop_url,
            parentStation: row.parentStation,
            timezone: row.timezone,
            wheelchairBoarding: wheelchairBoarding as GTFS.Stop['wheelchairBoarding'],
            level: {
              id: row.levelId,
            },
            platformCode: row.platformCode,
          })
          e.remote = remoteEntity
          e.updatedAt = date

          return e
        })

        // NOTE: uidが欲しい
        await this.stopService.bulkUpsert(stopEntities, true)

        const multiBar = new cliProgress.MultiBar({ format: `{name} {bar} {percentage}% | ETA: {eta}s | {value}/{total}` }, cliProgress.Presets.shades_classic)
        const bar1 = multiBar.create(stopEntities.length, 0, { name: 'linkStop' })
        const bar2 = multiBar.create(stopEntities.length, 0, { name: 'linkOrigin' })
        const bar3 = multiBar.create(stopEntities.length, 0, { name: 'linkDestination' })
        const bar4 = multiBar.create(stopEntities.length, 0, { name: 'linkContain' })
        const bar5 = multiBar.create(stopEntities.length, 0, { name: 'linkFromStop' })
        const bar6 = multiBar.create(stopEntities.length, 0, { name: 'linkToStop' })
        const bar7 = multiBar.create(stopEntities.length, 0, { name: 'linkFromStop' })
        const bar8 = multiBar.create(stopEntities.length, 0, { name: 'linkToStop' })
        for (const e of stopEntities) {
          await this.stopTimeService.linkStop(remoteEntity.uid, e.uid, e.id)
          bar1.increment()

          // // NOTE: UPDATEが重いので使わない間はコメントアウト
          await this.fareRuleService.linkOrigin(
            remoteEntity.uid,
            e.uid,
            e.zoneId,
          )
          bar2.increment()
          await this.fareRuleService.linkDestination(
            remoteEntity.uid,
            e.uid,
            e.zoneId,
          )
          bar3.increment()
          await this.fareRuleService.linkContain(
            remoteEntity.uid,
            e.uid,
            e.zoneId,
          )
          bar4.increment()
          await this.transferService.linkFromStop(remoteEntity.uid, e.uid, e.id)
          bar5.increment()
          await this.transferService.linkToStop(remoteEntity.uid, e.uid, e.id)
          bar6.increment()
          await this.pathwayService.linkFromStop(remoteEntity.uid, e.uid, e.id)
          bar7.increment()
          await this.pathwayService.linkToStop(remoteEntity.uid, e.uid, e.id)
          bar8.increment()
        }
        multiBar.stop()

        break

      case GTFSInterface.StaticFileNames.Routes:
        const bar9wefwer = new cliProgress.SingleBar({ format: `{name} {bar} {percentage}% | ETA: {eta}s | {value}/{total}` }, cliProgress.Presets.shades_classic)
        bar9wefwer.start(this.bulkBuffer.length, 0, { name: 'routeEntities' })
        const routeEntities = []

        for (const row of this.bulkBuffer) {
          const shortName = row.route_short_name || null
          const longName = row.route_long_name || null
          const type = Number(row.route_type)

          if (shortName === null && longName === null)
            throw new BadRequestException(
              'route_short_name and route_long_name can not be empty.',
            )
          if ([0, 1, 2, 3, 4, 5, 6, 7].includes(type) === false)
            throw new BadRequestException(
              `Can not use '${type}' for route_type.`,
            )

          const e = this.routeService.create(remoteEntity.uid, {
            id: row.route_id,
            agencyId: row.agency_id || null,
            name: {
              short: convertStringFullWidthToHalfWidth(shortName),
              long: convertStringFullWidthToHalfWidth(longName),
            },
            description: convertStringFullWidthToHalfWidth(
              row.route_desc || null,
            ),
            type: type as GTFS.Route['type'],
            url: row.route_url || null,
            color: row.route_color || null,
            textColor: row.route_text_color || null,
            sortOrder: Number(row.route_sort_order || 0),
          })
          e.remote = remoteEntity
          e.updatedAt = date

          // FIXME: manytomanyなのでsaveが必要
          e.attributions = await this.attributionService.findByRmoteUidAndRouteId_GetUidsOnly(
            remoteEntity.uid,
            row.route_id,
          )

          bar9wefwer.increment()
          routeEntities.push(e)
        }
        bar9wefwer.stop()
        await this.routeService.bulkUpsert(routeEntities, true)

        const bar0 = new cliProgress.SingleBar({ format: `{name} {bar} {percentage}% | ETA: {eta}s | {value}/{total}` }, cliProgress.Presets.shades_classic)
        bar0.start(routeEntities.length, 0, { name: 'linkRoute' })
        for (const routeEntity of routeEntities) {
          await this.fareRuleService.linkRoute(remoteEntity.uid, routeEntity.uid, routeEntity.id)

          await this.tripService.linkRoute(
            remoteEntity.uid,
            routeEntity.uid,
            routeEntity.id,
          )
          bar0.increment()
        }
        bar0.stop()

        break

      case GTFSInterface.StaticFileNames.Trips:
        const tripEntities = this.bulkBuffer.map(row => {
          const directionId = Number(row.direction_id)
          const wheelchairSccessible = Number(row.wheelchair_accessible)
          const bikesSllowed = Number(row.bikes_allowed)

          if (
            Number.isNaN(directionId) === false &&
            [0, 1].includes(directionId) === false
          )
            throw new BadRequestException(
              `Can not use '${directionId}' for direction_id.`,
            )
          if (
            Number.isNaN(wheelchairSccessible) === false &&
            [0, 1, 2].includes(wheelchairSccessible) === false
          )
            throw new BadRequestException(
              `Can not use '${wheelchairSccessible}' for wheelchair_accessible.`,
            )
          if (
            Number.isNaN(bikesSllowed) === false &&
            [0, 1, 2].includes(bikesSllowed) === false
          )
            throw new BadRequestException(
              `Can not use '${bikesSllowed}' for bikes_allowed.`,
            )

          const e = this.tripService.create(remoteEntity.uid, {
            routeId: row.route_id,
            serviceId: row.service_id,
            id: row.trip_id,
            headsign: convertStringFullWidthToHalfWidth(
              row.trip_headsign || null
            ),
            shortName: convertStringFullWidthToHalfWidth(
              row.trip_short_name || null
            ),
            directionId: Number.isNaN(directionId)
              ? null
              : (directionId as GTFS.Trip['directionId']),
            blockId: row.block_id || null,
            shapeId: row.shape_id || null,
            wheelchairSccessible: Number.isNaN(wheelchairSccessible)
              ? 0
              : (wheelchairSccessible as GTFS.Trip['wheelchairSccessible']),
            bikesSllowed: Number.isNaN(bikesSllowed)
              ? 0
              : (bikesSllowed as GTFS.Trip['bikesSllowed']),
          })
          e.remote = remoteEntity
          e.updatedAt = date

          // NOTE: Atom v2から持ってきたコードなので今後使う時は要検討
          // const [frequencies, attributions] = await Promise.all([
          //   this.frequencyService.getUidsOnly(remoteEntity.uid, row.trip_id),
          //   this.attributionService.findByRmoteUidAndRouteId_GetUidsOnly(
          //     remoteEntity.uid,
          //     row.trip_id,
          //   ),
          // ])

          // e.frequencies = frequencies
          // e.attributions = attributions

          return e
        })

        await this.tripService.bulkUpsert(tripEntities, true)

        const bar = new cliProgress.SingleBar({ format: `stopTimeService.linkTrip and link trip_shapes {bar} {percentage}% | ETA: {eta}s | {value}/{total}` }, cliProgress.Presets.shades_classic)
        bar.start(tripEntities.length, 0)
        for (const tripEntity of tripEntities) {
          await this.stopTimeService.linkTrip(
            remoteEntity.uid,
            tripEntity.uid,
            tripEntity.id,
          )

          // NOTE: なんかめっちゃ遅くなる時がある
          // console.log('shape reset')
          // tripEntity.shapes = []
          // await this.tripService.save(tripEntity)
          // console.log('shape reseted')

          // console.log('shape insert')
          tripEntity.shapes = await this.shapeService.getUidsOnly(
            remoteEntity.uid,
            tripEntity.shapeId,
          )
          await this.tripService.save(tripEntity)
          // console.log('shape inserted')

          bar.increment()
        }
        bar.stop()

        break

      case GTFSInterface.StaticFileNames.StopTimes:
        const es = this.bulkBuffer.map(row => {
          const sequence = Number(row.stop_sequence)
          const pickupType = Number(row.pickup_type || 0)
          const dropOffType = Number(row.drop_off_type || 0)
          const timepoint = Number(row.timepoint || 1)
          const shapeDistTraveled = Number(
            row?.shape_dist_traveled ?? '' === ''
              ? NaN
              : row.shape_dist_traveled,
          )

          if (Number.isNaN(sequence))
            throw new BadRequestException(
              `Can not use '${row.stop_sequence}' for sequence.`,
            )
          if ([0, 1, 2, 3].includes(pickupType) === false)
            throw new BadRequestException(
              `Can not use '${pickupType}' for pickup_type.`,
            )
          if ([0, 1, 2, 3].includes(dropOffType) === false)
            throw new BadRequestException(
              `Can not use '${dropOffType}' for drop_off_type.`,
            )
          if ([0, 1].includes(timepoint) === false)
            throw new BadRequestException(
              `Can not use '${timepoint}' for timepoint.`,
            )
          if (
            Number.isNaN(shapeDistTraveled) === false &&
            shapeDistTraveled < 0
          )
            throw new BadRequestException(
              'Only numbers can be used for shape_dist_traveled.',
            )

          const e = this.stopTimeService.create(remoteEntity.uid, {
            tripId: row.trip_id,
            time: {
              arrival: (row.arrival_time as unknown) as dayjs.Dayjs,
              departure: (row.departure_time as unknown) as dayjs.Dayjs,
            },
            stopId: row.stop_id,
            sequence: Number(row.stop_sequence),
            headsign: row.stop_headsign || null,
            pickupType: pickupType as GTFS.StopTime['pickupType'],
            dropOffType: dropOffType as GTFS.StopTime['dropOffType'],
            shapeDistTraveled: Number.isNaN(shapeDistTraveled)
              ? null
              : shapeDistTraveled,
            timepoint: timepoint as GTFS.StopTime['timepoint'],
          })
          e.remote = remoteEntity
          e.updatedAt = date

          return e
        })

        await this.stopTimeService.bulkUpsert(es)

        break

      case GTFSInterface.StaticFileNames.Calendar:
        await this.calendarService.bulkUpsert(
          this.bulkBuffer.map(row => {
            const monday = Number(row.monday)
            const tuesday = Number(row.tuesday)
            const wednesday = Number(row.wednesday)
            const thursday = Number(row.thursday)
            const friday = Number(row.friday)
            const saturday = Number(row.saturday)
            const sunday = Number(row.sunday)

            if ([0, 1].includes(monday) === false)
              throw new BadRequestException(
                `Can not use '${monday}' for monday.`,
              )
            if ([0, 1].includes(tuesday) === false)
              throw new BadRequestException(
                `Can not use '${tuesday}' for tuesday.`,
              )
            if ([0, 1].includes(wednesday) === false)
              throw new BadRequestException(
                `Can not use '${wednesday}' for wednesday.`,
              )
            if ([0, 1].includes(thursday) === false)
              throw new BadRequestException(
                `Can not use '${thursday}' for thursday.`,
              )
            if ([0, 1].includes(friday) === false)
              throw new BadRequestException(
                `Can not use '${friday}' for friday.`,
              )
            if ([0, 1].includes(saturday) === false)
              throw new BadRequestException(
                `Can not use '${saturday}' for saturday.`,
              )
            if ([0, 1].includes(sunday) === false)
              throw new BadRequestException(
                `Can not use '${sunday}' for sunday.`,
              )

            const e = this.calendarService.create(remoteEntity.uid, {
              serviceId: row.service_id,
              days: {
                mon: Boolean(monday),
                tues: Boolean(tuesday),
                wednes: Boolean(wednesday),
                thurs: Boolean(thursday),
                fri: Boolean(friday),
                satur: Boolean(saturday),
                sun: Boolean(sunday),
              },
              date: {
                start: (row.start_date as unknown) as moment.Moment,
                end: (row.end_date as unknown) as moment.Moment, // NOTE: typeorm側で変換するので、stringでも問題ない
              },
            })
            e.remote = remoteEntity
            e.updatedAt = date
            return e
          }),
        )
        break

      case GTFSInterface.StaticFileNames.CalendarDates:
        await this.calendarDateService.bulkUpsert(
          this.bulkBuffer.map(row => {
            const exceptionType = Number(row.exception_type)

            if ([1, 2].includes(exceptionType) === false)
              throw new BadRequestException(
                `Can not use ${exceptionType} for exception_type.`,
              )

            const e = this.calendarDateService.create(remoteEntity.uid, {
              serviceId: row.service_id,
              date: (row.date as unknown) as moment.Moment,
              exceptionType: exceptionType as GTFS.CalendarDate['exceptionType'],
            })
            e.remote = remoteEntity
            e.updatedAt = date
            return e
          }),
        )
        break

      case GTFSInterface.StaticFileNames.FareAttributes:
        await this.fareAttributeService.bulkUpsert(
          this.bulkBuffer.map(row => {
            const currencyType = row.currency_type
            const paymentMethod = Number(row.payment_method)
            const transfers = Number(row.transfers) || null
            const transferDuration = Number(row.transfer_duration)

            if (currencyType in ISO4217 === false)
              throw new BadRequestException(
                `Can not use '${currencyType}' for currency_type.`,
              )
            if ([0, 1].includes(paymentMethod) === false)
              throw new BadRequestException(
                `Can not use '${paymentMethod}' for payment_method.`,
              )
            if (transfers !== null && [0, 1, 2].includes(transfers) === false)
              throw new BadRequestException(
                `Can not use '${transfers}' for transfers.`,
              )
            if (
              row.transfer_duration !== undefined &&
              Number.isNaN(transferDuration)
            )
              throw new BadRequestException(
                'Only numbers can be used for transfer_duration.',
              )

            const e = this.fareAttributeService.create(remoteEntity.uid, {
              id: row.fare_id,
              price: Number(row.price),
              currencyType: currencyType as GTFS.FareAttribute['currencyType'],
              paymentMethod: paymentMethod as GTFS.FareAttribute['paymentMethod'],
              transfers: transfers as GTFS.FareAttribute['transfers'],
              agencyId: row.agency_id || null,
              transferDuration: transferDuration || null,
            })
            e.remote = remoteEntity
            e.updatedAt = date
            return e
          }),
        )
        break

      case GTFSInterface.StaticFileNames.FareRules:
        await this.fareRuleService.bulkUpsert(
          this.bulkBuffer.map(row => {
            const e = this.fareRuleService.create(remoteEntity.uid, {
              id: row.fare_id,
              routeId: row.route_id || null,
              originId: row.origin_id || null,
              destinationId: row.destination_id || null,
              containsId: row.contains_id || null,
            })
            e.remote = remoteEntity
            e.updatedAt = date

            return e
          }),
        )
        break

      case GTFSInterface.StaticFileNames.Shapes:
        await this.shapeService.bulkUpsert(
          this.bulkBuffer.map(row => {
            const lat = Number(row.shape_pt_lat)
            const lon = Number(row.shape_pt_lon)
            const sequence = Number(row.shape_pt_sequence)
            const distTraveled = Number(
              row?.shape_dist_traveled ?? '' === ''
                ? NaN
                : row.shape_dist_traveled,
            )

            if (Number.isNaN(lat)) {
              console.log({ fileName })
              throw new BadRequestException(
                'Only numbers can be used for shape_pt_lat.',
              )
            }
            if (Number.isNaN(lon))
              throw new BadRequestException(
                'Only numbers can be used for shape_pt_lon.',
              )
            if (Number.isNaN(sequence))
              throw new BadRequestException(
                'Only numbers can be used for shape_pt_sequence.',
              )
            if (Number.isNaN(distTraveled) === false && distTraveled < 0)
              throw new BadRequestException(
                'Only numbers can be used for shape_dist_traveled.',
              )

            const e = this.shapeService.create(remoteEntity.uid, {
              id: row.shape_id,
              location: {
                lat,
                lon,
              },
              sequence,
              distTraveled: Number.isNaN(distTraveled) ? null : distTraveled,
            })
            e.remote = remoteEntity
            e.updatedAt = date

            return e
          }),
        )
        break

      case GTFSInterface.StaticFileNames.Frequencies:
        await this.frequencyService.bulkUpsert(
          this.bulkBuffer.map(row => {
            const headwaySecs = Number(row.headway_secs)
            const exactTimes = Number(row.exact_times) || 0

            if (Number.isNaN(headwaySecs))
              throw new BadRequestException(
                'Only numbers can be used for headway_secs.',
              )
            if ([0, 1].includes(exactTimes) === false)
              throw new BadRequestException(
                `Can not use '${exactTimes}' for exact_times.`,
              )

            const e = this.frequencyService.create(remoteEntity.uid, {
              tripId: row.trip_id,
              time: {
                start: (row.start_time as unknown) as moment.Moment,
                end: (row.end_time as unknown) as moment.Moment,
              },
              headwaySecs,
              exactTimes: exactTimes as GTFS.Frequency['exactTimes'],
            })
            e.remote = remoteEntity
            e.updatedAt = date
            return e
          }),
        )
        break

      case GTFSInterface.StaticFileNames.Transfers:
        await this.transferService.bulkUpsert(
          this.bulkBuffer.map(row => {
            const transferType = Number(row.transfer_type)
            const minTransferTime = Number(row.min_transfer_time)

            if ([0, 1, 2, 3].includes(transferType) === false)
              throw new BadRequestException(
                `Can not use '${transferType}' for transfer_type.`,
              )
            if (transferType === 2) {
              if (row.min_transfer_time === undefined)
                throw new BadRequestException(
                  'When transfer_type is 2, specify an integer of 0 or more for min_transfer_time.',
                )
              if (Number.isNaN(minTransferTime))
                throw new BadRequestException(
                  'Only numbers can be used for min_transfer_time.',
                )
            }

            const e = this.transferService.create(
              remoteEntity.uid,
              transferType === 2
                ? {
                  stop: {
                    from: { id: row.from_stop_id },
                    to: { id: row.to_stop_id },
                  },
                  type: transferType,
                  time: {
                    min: minTransferTime,
                  },
                }
                : {
                  stop: {
                    from: { id: row.from_stop_id },
                    to: { id: row.to_stop_id },
                  },
                  type: transferType as 0 | 1 | 3,
                },
            )
            e.remote = remoteEntity
            e.updatedAt = date
            return e
          }),
        )
        break

      case GTFSInterface.StaticFileNames.Pathways:
        await this.pathwayService.bulkUpsert(
          this.bulkBuffer.map(row => {
            const pathwayMode = Number(row.pathway_mode)
            const isBidirectional = Number(row.is_bidirectional)

            if ([0, 1, 2, 3, 4, 5, 6, 7].includes(pathwayMode) === false)
              throw new BadRequestException(
                `Can not use '${pathwayMode}' for pathway_mode.`,
              )

            if ([0, 1].includes(isBidirectional) === false)
              throw new BadRequestException(
                `Can not use '${isBidirectional}' for is_bidirectional.`,
              )

            const e = this.pathwayService.create(remoteEntity.uid, {
              id: row.pathway_id,
              from: { stop: { id: row.from_stop_id } },
              to: { stop: { id: row.to_stop_id } },
              pathwayMode: pathwayMode as GTFS.Pathway['pathwayMode'],
              isBidirectional: isBidirectional as GTFS.Pathway['isBidirectional'],
              length:
                row.length === undefined || row.length === ''
                  ? null
                  : Number(row.length),
              traversalTime:
                row.traversal_time === undefined || row.traversal_time === ''
                  ? null
                  : Number(row.traversal_time),
              stair: {
                count:
                  row.stair_count === undefined || row.stair_count === ''
                    ? null
                    : Number(row.stair_count),
              },
              slope: {
                max:
                  row.max_slope === undefined || row.max_slope === ''
                    ? null
                    : Number(row.max_slope),
              },
              width: {
                min:
                  row.min_width === undefined || row.min_width === ''
                    ? null
                    : Number(row.min_width),
              },
              signpostedAs: row.signposted_as || null,
              reversedSignpostedAs: row.reversed_signposted_as || null,
            })
            e.remote = remoteEntity
            e.updatedAt = date
            return e
          }),
        )
        break

      case GTFSInterface.StaticFileNames.Levels:
        await this.levelService.bulkUpsert(
          this.bulkBuffer.map(row => {
            const e = this.levelService.create(remoteEntity.uid, {
              id: row.level_id,
              index: Number(row.level_index),
              name: row.level_name || null,
            })
            e.remote = remoteEntity
            e.updatedAt = date
            return e
          }),
        )
        break

      case GTFSInterface.StaticFileNames.FeedInfo:
        await this.feedInfoService.bulkUpsert(
          this.bulkBuffer.map(row => {
            const feedStartDate: string | null = row.feed_start_date || null
            const feedEndtDate: string | null = row.feed_end_date || null

            const startDate = dayjs(feedStartDate, 'YYYYMMDD')
            const endDate = dayjs(feedEndtDate, 'YYYYMMDD')

            if (feedEndtDate || feedEndtDate) {
              if (feedEndtDate && startDate.isValid() === false)
                throw new BadRequestException(
                  'The format of feed_start_date is incorrect.',
                )
              if (row.feed_end_date && endDate.isValid() === false)
                throw new BadRequestException(
                  'The format of feed_end_date is incorrect.',
                )
              if (feedStartDate && feedEndtDate && endDate.isBefore(startDate))
                throw new BadRequestException(
                  'feed_end_date must specify a date after feed_start_date.',
                )
            }

            const e = this.feedInfoService.create(remoteEntity.uid, {
              publisher: {
                name: row.feed_publisher_name,
                url: row.feed_publisher_url,
              },
              defaultLang: row.default_lang || null,
              lang: row.feed_lang,
              date: {
                start: startDate,
                end: endDate,
              },
              version: row.feed_version || null,
              contact: {
                email: row.feed_contact_email || null,
                url: row.feed_contact_url || null,
              },
            })
            e.remote = remoteEntity
            e.updatedAt = date
            return e
          }),
        )
        break

      case GTFSInterface.StaticFileNames.Translations:
        await this.translationService.bulkUpsert(
          this.bulkBuffer.map(row => {
            if (
              [
                'agency',
                'stops',
                'routes',
                'trips',
                'stop_times',
                'feed_info',
              ].includes(row.table_name) === false
            )
              throw new BadRequestException(
                `Can not use '${row.table_name}' for table_name.`,
              )

            const e = this.translationService.create(remoteEntity.uid, {
              tableName: TableName[_.upperFirst(_.camelCase(row.table_name))],
              fieldName: row.field_name,
              language: row.language,
              translation: row.translation,
              record: {
                id: row.record_id || null,
                sub: {
                  id:
                    row.record_sub_id === undefined || row.record_sub_id === ''
                      ? null
                      : Number(row.record_sub_id),
                },
              },
              fieldValue: row.field_value || null,
            })
            e.remote = remoteEntity
            e.updatedAt = date
            return e
          }),
        )
        break

      case GTFSInterface.StaticFileNames.Attributions:
        await this.attributionService.bulkUpsert(
          this.bulkBuffer.map(row => {
            const isProducer = Number(row.is_producer)
            const isOperator = Number(row.is_operator)
            const isAuthority = Number(row.is_authority)

            if ([0, 1].includes(isProducer) === false)
              throw new BadRequestException(
                'The format of is_producer is incorrect.',
              )
            if ([0, 1].includes(isOperator) === false)
              throw new BadRequestException(
                'The format of is_operator is incorrect.',
              )
            if ([0, 1].includes(isAuthority) === false)
              throw new BadRequestException(
                'The format of is_authority is incorrect.',
              )

            const e = this.attributionService.create(remoteEntity.uid, {
              id: row.attribution_id || null,
              url: row.attribution_url || null,
              email: row.attribution_email || null,
              phone: row.attribution_phone || null,
              agency: {
                id: row.agency_id || null,
              },
              route: {
                id: row.route_id || null,
              },
              trip: {
                id: row.trip_id || null,
              },
              organization: {
                name: row.organization_name,
              },
              isProducer: isProducer as GTFS.Attribution['isProducer'],
              isOperator: isOperator as GTFS.Attribution['isOperator'],
              isAuthority: isAuthority as GTFS.Attribution['isAuthority'],
            })
            e.remote = remoteEntity
            e.updatedAt = date
            return e
          }),
        )
        break
    }
  }

  // bulk insert用
  private bulkBuffer: { [k: string]: string }[] = []

  static i = 0

  // NOTE: 呼び出し元である程度インポート順を制御する
  @Transactional()
  async bulkImport(
    remoteEntity: Remote,
    fileName: string,
    rowData?: { [k: string]: string },
  ) {
    if (typeof rowData === 'object') this.bulkBuffer.push(rowData)
    if (
      (typeof rowData === 'object' &&
        this.bulkBuffer.length <
        this.configService.get<number>('database.insert.buffer', 2000)) || // NOTE: bulk insert上限
      (typeof rowData === undefined && this.bulkBuffer.length === 0) // NOTE: 要らないかもしれない
    )
      return

    // if (process.env.NODE_ENV === 'development')
    //   console.timeLog(
    //     `${remoteEntity.id} ${fileName}`,
    //     `bulk insert ${RemoteService.i++}`,
    //   )

    await this.insert(remoteEntity, fileName)

    this.bulkBuffer = []
  }

  @Transactional()
  async create(
    id: Remote['id'],
    display: RegistrationRemoteDto['display'],
    portal: RegistrationRemoteDto['portal'],
    license: RegistrationRemoteDto['license'],
  ): Promise<Remote> {
    const remoteEntity =
      (await this.remoteRepository.findOneById(id, {
        relations: ['gtfsStatic', 'gtfsRealtimes'],
      })) ?? this.remoteRepository.create({ id })
    remoteEntity.displayName = display.name
    remoteEntity.portalUrl = portal.url
    remoteEntity.license = license.type
    remoteEntity.licenseUrl = license.url

    return remoteEntity
  }

  @Transactional()
  @ModeDecoratores.DataUpdater()
  async registrationGTFSInfo(
    data: { id: string } & RegistrationRemoteDto,
  ): Promise<Remote> {
    const remoteEntity = await this.create(
      data.id,
      data.display,
      data.portal,
      data.license,
    )

    if (remoteEntity.crawlStatus === CrawlStatus.IMPORTING) return remoteEntity

    // NOTE: GTFS情報とRemoteを紐付け
    remoteEntity.gtfsStatic = await this.gtfsStaticService.createOrUpdate(
      remoteEntity.uid,
      data.static.url,
    )

    // NOTE: GTFS-RT情報とRemoteを紐付け
    const gtfsRTUrls: [FeedType, string?][] = [
      [FeedType.TRIP_UPDATE, data.realtime.trip_update.url],
      [FeedType.VEHICLE_POSITION, data.realtime.vehicle_position.url],
      [FeedType.ALERT, data.realtime.alert.url],
    ]
    remoteEntity.gtfsRealtimes = await Promise.all(
      gtfsRTUrls.reduce<Promise<GtfsRealtime>[]>(
        (prev, [feedType, url]) =>
          url
            ? [
              ...prev,
              this.gtfsRTService.createOrUpdate(
                remoteEntity.uid,
                feedType,
                url,
              ),
            ]
            : prev,
        [],
      ),
    )

    // NOTE: Remoteのuidが欲しいので一旦save
    await this.remoteRepository.save(remoteEntity)

    return remoteEntity
  }

  @Transactional()
  async importGTFSStaticData(remoteEntity: Remote, archiveData: any) {
    remoteEntity.gtfsStatic.latestFetchedDate = archiveData.archive.downloadDate
    remoteEntity.gtfsStatic.latestFetchedHash = archiveData.archive.hash

    // 親に依存しているものを先にinsertする(一々findOneやってたらめちゃ遅い)
    for (const fN of [...(archiveData.entry.fileNames as string[])].sort(
      (a, b) =>
        RemoteService.importProcessingOrder[b] -
        RemoteService.importProcessingOrder[a],
    )) {
      await new Promise<void>(async (res, rej) => {
        try {
          const streamRows = fastCsv.parseFile(
            path.join('temp', remoteEntity.id, fN),
            { headers: true, ignoreEmpty: true },
          )
          console.time(`${remoteEntity.id} ${fN}`)

          console.time('calc csv length')
          const rowCount = await new Promise<number>((res, rej) => {
            let count = 0;
            fastCsv.parseFile(
              path.join('temp', remoteEntity.id, fN),
              { headers: true, ignoreEmpty: true },
            ).on('data', () => {
              count += 1
            }).on('end', () => {
              res(count)
            }).once('error', rej)
          })
          console.timeEnd('calc csv length')

          const bar = new cliProgress.SingleBar({ format: `${fN} {bar} {percentage}% | ETA: {eta}s | {value}/{total}` }, cliProgress.Presets.shades_classic)
          bar.start(rowCount, 0)

          for await (const row of streamRows) {
            await this.bulkImport(remoteEntity, fN, row)
            bar.increment()
          }
          await this.bulkImport(remoteEntity, fN)
          bar.stop()
          console.timeEnd(`${remoteEntity.id} ${fN}`)
          res()
        } catch (e) {
          this.bulkBuffer = []

          rej(e)
        }
      })
    }

    // NOTE: 実際に使われるshapeのみ抽出
    const trips = await this.tripService.getStopTimeCounts(remoteEntity.uid)

    const stopTimeが一番多いtrip: {
      [shapeId: string]: AwaitReturnType<
        TripService['getStopTimeCounts']
      >[number]
    } = {}
    trips.forEach(trip => {
      if (stopTimeが一番多いtrip[trip.shapeId] === undefined) {
        stopTimeが一番多いtrip[trip.shapeId] = trip

        return
      }

      if (
        stopTimeが一番多いtrip[trip.shapeId].stopTimeCount < trip.stopTimeCount
      )
        stopTimeが一番多いtrip[trip.shapeId] = trip
    })

    const bar = new cliProgress.SingleBar({ format: `{name} {bar} {percentage}% | ETA: {eta}s | {value}/{total}` }, cliProgress.Presets.shades_classic)
    bar.start(Object.values(stopTimeが一番多いtrip).length, 0, { name: 'link calced shapes' })
    for (const tripObj of Object.values(stopTimeが一番多いtrip)) {
      const trip = await this.tripService.findOneByUid(tripObj.uid, [
        'stopTimes',
        'stopTimes.stop',
        'shapes',
      ])

      // FIXME: 開発者が時間取れず誰もPR送らない可愛そうなポンコツORM
      trip.shapes.sort((a, b) => a.sequence - b.sequence)

      let shapeIndex = 0
      let lastCaledShapeSequence = null
      let lastCaledDuplicateCount = 0

      // NOTE: 停留所位置をshapes上に持ってくる
      const calcedShapes: Shape[] = []
      for (const stopTime of trip.stopTimes) {
        const stop = stopTime.stop

        let p1: Shape
        let p2: Shape
        let cP: ReturnType<typeof closestPoint> = null

        for (let i = shapeIndex; i < trip.shapes.length - 1; i++) {
          p1 = trip.shapes[i]
          p2 = trip.shapes[i + 1]

          const _cP = closestPoint(stop.location, p1.location, p2.location)

          if (
            0 <= _cP.rangeRate &&
            _cP.rangeRate <= 1 &&
            geolib.getPreciseDistance(_cP.location, stop.location) <= 20
          ) {
            cP = _cP
            shapeIndex = i

            break
          }
        }

        if (cP) {
          let sequence =
            p1.sequence +
            ((p2?.sequence ?? p1.sequence + 0.5) - p1.sequence) / 2
          if (
            lastCaledShapeSequence !== null &&
            sequence === lastCaledShapeSequence
          ) {
            sequence = sequence + sequence / (2 + lastCaledDuplicateCount)
            lastCaledDuplicateCount += 1
          } else {
            lastCaledShapeSequence = sequence
            lastCaledDuplicateCount = 0
          }

          const shape = this.shapeService.create(
            remoteEntity.uid,
            {
              id: p1.id,
              location: cP.location,
              sequence,
              distTraveled: p2?.distTraveled ?? p1.distTraveled,
            },
            true,
          )
          shape.remote = remoteEntity
          shape.stop = stopTime.stop

          calcedShapes.push(shape)
        }
      }

      await this.shapeService.bulkUpsert(calcedShapes, true)
      // await this.shapeService.saves(calcedShapes)

      const { trips } = await this.shapeService.findOneByUid(
        trip.shapes[0].uid,
        ['trips'],
      )

      for (const trip2 of trips) {
        // console.log('reset shape')
        // trip2.shapes = []
        // await this.tripService.save(trip2)
        // console.log('reseted shape')

        trip2.shapes = [...trip.shapes, ...calcedShapes]
        await this.tripService.save(trip2)

      }
      bar.increment()
    }
    bar.stop()

    console.time(`${remoteEntity.id} stop clustering`)
    const stops = await this.stopService.findByRemoteUid(remoteEntity.uid)
    const stopCluster = new Supercluster({
      minZoom: 0,
      maxZoom: 22
    })
    const geojson: Supercluster.PointFeature<Supercluster.AnyProps>[] = stops.map(stop => ({
      id: stop.uid,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [stop.location.lon, stop.location.lat]
      },
      properties: null
    }))
    // console.log(JSON.stringify(geojson))
    console.timeLog(`${remoteEntity.id} stop clustering`, 'load geojson')
    stopCluster.load(geojson)
    console.timeLog(`${remoteEntity.id} stop clustering`, 'loaded geojson')

    const sw = await this.stopService.findSWByRemoteUid(remoteEntity.uid)
    const ne = await this.stopService.findNEByRemoteUid(remoteEntity.uid)

    for (let zoomLevel = 0; zoomLevel <= 17; zoomLevel++) {
      console.timeLog(`${remoteEntity.id} stop clustering`, `zoomLevel ${zoomLevel}`)

      const swXY = degrees2meters(zoomLevel, sw.lat, sw.lon);
      const neXY = degrees2meters(zoomLevel, ne.lat, ne.lon);


      for (let latIndex = neXY.lat; latIndex <= swXY.lat; latIndex++) {
        for (let lonIndex = swXY.lon; lonIndex <= neXY.lon; lonIndex++) {
          const nw2 = pixelOnTileToLatLon(zoomLevel, lonIndex, latIndex)
          const se2 = pixelOnTileToLatLon(zoomLevel, lonIndex, latIndex, 256, 256)

          const a: [number, number, number, number] = [
            nw2.lon,
            se2.lat,
            se2.lon,
            nw2.lat
          ]
          const results = stopCluster.getClusters(a, zoomLevel)

          if (results.length === 0) continue

          const stopClusters = await Promise.all(results.map(async result => {
            const isCluster = result.properties?.cluster === true
            const location = {
              lon: result.geometry.coordinates[0],
              lat: result.geometry.coordinates[1]
            }

            const dbStopClusterEntity = await this.stopClusterService.findOneByRemoteUidAndZoomLevelAndGeohash(remoteEntity.uid, zoomLevel, this.stopClusterService.geohashEncode(location))
            const stopClusterEntity = dbStopClusterEntity || this.stopClusterService.create({ zoom: { level: zoomLevel }, location })
            stopClusterEntity.remote = remoteEntity
            if (isCluster) {
              const stopPoints = stopCluster.getLeaves(result.properties.cluster_id, stops.length)
              stopClusterEntity.stops = stopPoints.map(stop => ({ uid: stop.id } as Stop))
            } else {
              stopClusterEntity.stops = [{ uid: result.id } as Stop]
            }

            return stopClusterEntity
          }))

          await this.stopClusterService.save(stopClusters)
        }
      }
    }
    console.timeEnd(`${remoteEntity.id} stop clustering`)
  }

  @ModeDecoratores.DataUpdater()
  async GTFSDownloadAndAnalyzer(remote: Remote) {
    const beforeUpgradeDirPath: string = path.join(
      'temp_before_upgrade',
      remote.id,
    )
    const upgradedDirPath: string = path.join('temp', remote.id)

    const archiveData =
      // NOTE: cleanup GTFS static data
      await Promise.all([del(beforeUpgradeDirPath), del(upgradedDirPath)])
        .then(() =>
          this.gtfsArchiveService.download(
            remote.gtfsStatic.url,
            beforeUpgradeDirPath,
          ),
        )
        .catch(async e => {
          // NOTE: cleanup GTFS static data
          await del(beforeUpgradeDirPath)

          throw e
        })

    Logger.debug(
      `Successfully downloaded gtfs static data for remote ID '${remote.id}'.`,
      'Atom',
      false,
    )

    const upgrade = await this.gtfsArchiveService
      .upgrade(beforeUpgradeDirPath, upgradedDirPath)
      .catch(async e => {
        // NOTE: cleanup GTFS static data
        await Promise.all([del(beforeUpgradeDirPath), del(upgradedDirPath)])

        throw e
      })

    if (upgrade) {
      await del(beforeUpgradeDirPath)
    } else {
      await fs.rename(beforeUpgradeDirPath, upgradedDirPath)
    }

    Logger.debug(
      `Successfully upgraded gtfs static data in remote ID '${remote.id}'.`,
      'Atom',
      false,
    )

    // NOTE: cleanup GTFS static data
    // await del(upgradedDirPath)

    return archiveData
  }

  @Transactional()
  async setCrawlStatus(
    remote: Remote,
    crawlStatus: CrawlStatus,
  ): Promise<Remote> {
    remote.crawlStatus = crawlStatus

    return this.remoteRepository.save(remote)
  }

  @Transactional()
  async findOneByRemoteUId(remoteUId: Remote['uid']): Promise<Remote> {
    return this.remoteRepository.findOne({
      relations: ['gtfsStatic', 'gtfsRealtimes'],
      where: { uid: remoteUId },
    })
  }

  toGraphQLSchema(remote: Remote): RemoteModel.Output {
    // NOTE: ループ一回で回すか一個ずつGtfsRealtime経由で取るか迷い続けている
    const tp = remote.gtfsRealtimes.find(
      ({ feedType }) => feedType === FeedType.TRIP_UPDATE,
    )
    const vp = remote.gtfsRealtimes.find(
      ({ feedType }) => feedType === FeedType.VEHICLE_POSITION,
    )
    const alert = remote.gtfsRealtimes.find(
      ({ feedType }) => feedType === FeedType.ALERT,
    )

    return {
      id: remote.id,
      crawl: {
        status: StatusResult[remote.crawlStatus],
      },
      display: {
        name: remote.displayName,
      },
      portal: {
        url: remote.portalUrl,
      },
      license: {
        type: remote.license,
        url: remote.licenseUrl,
      },
      static: {
        url: remote.gtfsStatic.url,
        lastFetchedDate: remote.gtfsStatic.latestFetchedDate.toISOString(),
      },
      realtime: {
        trip_update: {
          url: tp.url,
          lastFetchedDate: tp.latestFetchedDate.toISOString() ?? null,
        },
        vehicle_position: {
          url: vp.url,
          lastFetchedDate: vp.latestFetchedDate.toISOString() ?? null,
        },
        alert: {
          url: alert.url,
          lastFetchedDate: alert.latestFetchedDate.toISOString() ?? null,
        },
      },
    }
  }

  @Transactional()
  async findOneByRemoteId(remoteId: Remote['id']): Promise<Remote> {
    const remote = await this.remoteRepository.findOne({
      relations: ['gtfsStatic', 'gtfsRealtimes'],
      where: { id: remoteId },
    })

    return remote;
  }

  @Transactional()
  async findByRemoteIds(remoteIds: Remote['id'][]): Promise<Remote[]> {
    return this.remoteRepository.find({
      relations: ['gtfsStatic', 'gtfsRealtimes'],
      where: { id: In(remoteIds) }
    })
  }

  @Transactional()
  async findAllResponse(): Promise<RemoteModel.Output[]> {
    const remotes = await this.remoteRepository.find({
      relations: ['gtfsStatic', 'gtfsRealtimes'],
    })

    const responseData = remotes.map<RemoteModel.Output>(this.toGraphQLSchema)

    return responseData
  }
}
