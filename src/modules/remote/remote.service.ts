import { ConfigService } from '@nestjs/config'
import * as GTFS from '@come25136/gtfs'
import * as _ from 'lodash'
import * as del from 'del'
import * as fastCsv from 'fast-csv'
import * as moment from 'moment'
import * as path from 'path'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { FindManyOptions } from 'typeorm'
import { Propagation, Transactional } from 'typeorm-transactional-cls-hooked'
import { promises as fs } from 'fs'

import { ISO4217, convertStringFullWidthToHalfWidth } from 'src/util'
import {
  FeedType,
  GtfsRealtime,
} from 'src/database/tables/gtfs-realtime/gtfs_realtime.entity'
import { AgencyService } from 'src/modules/agency/agency.service'
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
import { RegistrationRemoteDto } from 'src/modules/interfaces/remote.dto'
import { RemoteRepository } from 'src/database/tables/remote/remote.repository'
import { Remote } from 'src/database/tables/remote/remote.entity'
import { RouteService } from 'src/modules/route/route.service'
import { ShapeService } from 'src/modules/shape/shape.service'
import { StopService } from 'src/modules/stop/stop.service'
import { StopTimeService } from 'src/modules/stop-time/stop-time.service'
import { TableName } from 'src/database/tables/translation/translation.entity'
import { TransferService } from 'src/modules/transfer/transfer.service'
import { TranslationService } from 'src/modules/translation/translation.service'
import { TripService } from 'src/modules/trip/trip.service'
import { AttributionService } from 'src/modules/attribution/attribution.service'

import GTFSInterface from '../interfaces/gtfs'

@Injectable()
export class RemoteService {
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
  ) {}

  // NOTE: 依存すればするほど数字を大きくする
  static readonly importProcessingOrder = {
    'agency.txt': 0,
    'stops.txt': 1, // NOTE: levelsに依存
    'routes.txt': 1, // NOTE: agencyに依存
    'trips.txt': 2, // NOTE: route, calendar(_dates), shapesに依存
    'stop_times.txt': 3, // NOTE: trips, stopsに依存
    'calendar.txt': 0,
    'calendar_dates.txt': 0,
    'fare_attributes.txt': 1, // NOTE: agencyに依存
    'fare_rules.txt': 2, // NOTE: fare_attributes, routes, stopsに依存
    'shapes.txt': 0,
    'frequencies.txt': 3, // NOTE: tripsに依存
    'transfers.txt': 1, // NOTE: stopsに依存
    'pathways.txt': 1, // NOTE: stopsに依存
    'levels.txt': 0,
    'feed_info.txt': 0,
    'translations.txt': 0, // NOTE: 変に紐付けるより後で全検索する方が綺麗
    'attributions.txt': 3, // NOTE: agency, routes, tripsに依存
  } as const

  @Transactional()
  private async insert(remoteEntity: Remote, fileName: string) {
    const date = moment() // TODO: 外に出す

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

        await this.agencyService.save(agencyEntities, true)

        for (const e of agencyEntities) {
          this.routeService.linkAgency(remoteEntity.uid, e.uid, e.id)
          this.fareAttributeService.linkAgency(remoteEntity.uid, e.uid, e.id)
          this.attributionService.linkAgency(remoteEntity.uid, e.uid, e.id)
        }

        break

      case GTFSInterface.StaticFileNames.Stops:
        const stopTimeEntities = this.bulkBuffer.map(row => {
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
        await this.stopService.save(stopTimeEntities, true)

        for (const e of stopTimeEntities) {
          await this.stopTimeService.linkStop(remoteEntity.uid, e.uid, e.id)

          // NOTE: UPDATEが重いので使わない間はコメントアウト
          // await this.fareRuleService.linkOrigin(remoteEntity.uid, e.uid, e.zoneId,)
          // await this.fareRuleService.linkDestination(remoteEntity.uid, e.uid, e.zoneId,)
          // await this.fareRuleService.linkContain(remoteEntity.uid, e.uid, e.zoneId,)
          // await this.transferService.linkFromStop(remoteEntity.uid, e.uid, e.id)
          // await this.transferService.linkToStop(remoteEntity.uid, e.uid, e.id)
          // await this.pathwayService.linkFromStop(remoteEntity.uid, e.uid, e.id)
          // await this.pathwayService.linkToStop(remoteEntity.uid, e.uid, e.id)
        }

        break

      case GTFSInterface.StaticFileNames.Routes:
        await this.routeService.save(
          await Promise.all(
            this.bulkBuffer.map(async row => {
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
              e.fareRules = await this.fareRuleService.findByRmoteUidAndRouteId_GetUidsOnly(
                remoteEntity.uid,
                row.route_id,
              )
              e.attributions = await this.attributionService.findByRmoteUidAndRouteId_GetUidsOnly(
                remoteEntity.uid,
                row.route_id,
              )

              return e
            }),
          ),
        )
        break

      case GTFSInterface.StaticFileNames.Trips:
        const tripEntities = await Promise.all(
          this.bulkBuffer.map(async row => {
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
                row.trip_headsign || null,
              ),
              shortName: convertStringFullWidthToHalfWidth(
                row.trip_short_name || null,
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
          }),
        )
        await this.tripService.save(tripEntities, true)
        for (const tripEntity of tripEntities) {
          await this.stopTimeService.linkTrip(
            remoteEntity.uid,
            tripEntity.uid,
            tripEntity.id,
          )
        }
        break

      case GTFSInterface.StaticFileNames.StopTimes:
        await this.stopTimeService.save(
          await Promise.all(
            this.bulkBuffer.map(async row => {
              const pickupType = Number(row.pickup_type || 0)
              const dropOffType = Number(row.drop_off_type || 0)
              const timepoint = Number(row.timepoint || 1)

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

              const e = this.stopTimeService.create(remoteEntity.uid, {
                tripId: row.trip_id,
                time: {
                  arrival: (row.arrival_time as unknown) as moment.Moment,
                  departure: (row.departure_time as unknown) as moment.Moment,
                },
                stopId: row.stop_id,
                sequence: Number(row.stop_sequence),
                headsign: row.stop_headsign || null,
                pickupType: pickupType as GTFS.StopTime['pickupType'],
                dropOffType: dropOffType as GTFS.StopTime['dropOffType'],
                shapeDistTraveled: Number(row.shape_dist_traveled) || null,
                timepoint: timepoint as GTFS.StopTime['timepoint'],
              })
              e.remote = remoteEntity
              e.updatedAt = date

              return e
            }),
          ),
        )
        break

      case GTFSInterface.StaticFileNames.Calendar:
        await this.calendarService.save(
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
        await this.calendarDateService.save(
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
        await this.fareAttributeService.save(
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
        await this.fareRuleService.save(
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
        await this.shapeService.save(
          this.bulkBuffer.map(row => {
            const lat = Number(row.shape_pt_lat)
            const lon = Number(row.shape_pt_lon)
            const sequence = Number(row.shape_pt_sequence)
            const distTraveled = Number(row.shape_dist_traveled || null)

            if (Number.isNaN(lat))
              throw new BadRequestException(
                'Only numbers can be used for shape_pt_lat.',
              )
            if (Number.isNaN(lon))
              throw new BadRequestException(
                'Only numbers can be used for shape_pt_lon.',
              )
            if (Number.isNaN(sequence))
              throw new BadRequestException(
                'Only numbers can be used for shape_pt_sequence.',
              )
            if (Number.isNaN(distTraveled) === false && distTraveled < 0) {
              console.log(row)
              throw new BadRequestException(
                'Only numbers can be used for shape_dist_traveled.',
              )
            }
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
        await this.frequencyService.save(
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
        await this.transferService.save(
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
        await this.pathwayService.save(
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
        await this.levelService.save(
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
        await this.feedInfoService.save(
          this.bulkBuffer.map(row => {
            const feedStartDate: string | null = row.feed_start_date || null
            const feedEndtDate: string | null = row.feed_end_date || null

            const startDate = moment(feedStartDate, 'YYYYMMDD')
            const endDate = moment(feedEndtDate, 'YYYYMMDD')

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
        await this.translationService.save(
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
        await this.attributionService.save(
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

  // NOTE: 呼び出し元である程度インポート順を制御する
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
      (await this.remoteRepository.findOneById(id)) ??
      this.remoteRepository.create({ id })
    remoteEntity.displayName = display.name
    remoteEntity.portalUrl = portal.url
    remoteEntity.license = license.type
    remoteEntity.licenseUrl = license.url

    return remoteEntity
  }

  @Transactional()
  private async registrationGTFSInfo(
    data: { id: string } & RegistrationRemoteDto,
  ): Promise<Remote> {
    const remoteEntity = await this.create(
      data.id,
      data.display,
      data.portal,
      data.license,
    )

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

  private async inportGTFSStaticData(
    data: { id: string },
    remoteEntity: Remote,
    archiveData: any,
  ) {
    // 親に依存しているものを先にinsertする(一々findOneやってたらめちゃ遅い)
    for (const fN of [...(archiveData.entry.fileNames as string[])].sort(
      (a, b) =>
        RemoteService.importProcessingOrder[b] -
        RemoteService.importProcessingOrder[a],
    )) {
      console.log({ fN })
      // if (fN !== 'stops.txt') continue
      await new Promise<void>(async (res, rej) => {
        try {
          const rows = fastCsv.parseFile(
            path.join('temp', remoteEntity.id, fN),
            { headers: true, ignoreEmpty: true },
          )
          console.time(`${data.id} ${fN}`)
          let i = 0
          for await (const row of rows) {
            await this.bulkImport(remoteEntity, fN, row)
            // console.timeLog(`${data.id} ${fN}`, `bulk insert ${i++}`)
          }
          await this.bulkImport(remoteEntity, fN)
          console.timeEnd(`${data.id} ${fN}`)
          res()
        } catch (e) {
          rej(e)
        }
      })
    }
  }

  async registration(
    data: { id: string } & RegistrationRemoteDto,
  ): Promise<Remote> {
    const beforeUpgradeDirPath: string = path.join(
      'temp_before_upgrade',
      data.id,
    )
    const upgradedDirPath: string = path.join('temp', data.id)

    const archiveData =
      // NOTE: cleanup GTFS static data
      await Promise.all([del(beforeUpgradeDirPath), del(upgradedDirPath)])
        .then(() =>
          this.gtfsArchiveService.download(
            data.static.url,
            beforeUpgradeDirPath,
          ),
        )
        .catch(async e => {
          // NOTE: cleanup GTFS static data
          await del(beforeUpgradeDirPath)

          throw e
        })

    Logger.debug(
      `Successfully downloaded gtfs static data for remote ID '${data.id}'.`,
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

    if (upgrade) await del(beforeUpgradeDirPath)
    else await fs.rename(beforeUpgradeDirPath, upgradedDirPath)

    Logger.debug(
      `Successfully upgraded gtfs static data in remote ID '${data.id}'.`,
      'Atom',
      false,
    )

    console.time('import')
    const remoteEntity = await this.registrationGTFSInfo(data)
    await this.inportGTFSStaticData(data, remoteEntity, archiveData)
    console.timeEnd('import')

    // NOTE: cleanup GTFS static data
    await Promise.all([del(beforeUpgradeDirPath), del(upgradedDirPath)])

    return remoteEntity
  }

  async findAll(options?: FindManyOptions<Remote>): Promise<Remote[]> {
    return this.remoteRepository.find(options)
  }
}
