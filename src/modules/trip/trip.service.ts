import * as GTFS from '@come25136/gtfs'
import * as _ from 'lodash'
import * as dayjs from 'dayjs'
import { Injectable, NotFoundException } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import * as dayjsTimezone from 'dayjs/plugin/timezone'
import * as dayjsUtc from 'dayjs/plugin/utc'
import { AgencyRepository } from 'src/database/tables/agency/agency.repository'
import { CalendarDateRepository } from 'src/database/tables/calendar-date/calendar_date.repository'
import { CalendarRepository } from 'src/database/tables/calendar/calendar.repository'
import { Remote } from 'src/database/tables/remote/remote.entity'
import { StopTimeRepository } from 'src/database/tables/stop-time/stop_time.repository'
import { Trip } from 'src/database/tables/trip/trip.entity'
import { TripRepository } from 'src/database/tables/trip/trip.repository'
import { h24ToLessH24 } from 'src/util'
import { ServiceService } from '../service/service.service'

dayjs.extend(dayjsUtc)
dayjs.extend(dayjsTimezone)

@Injectable()
export class TripService {
  constructor(
    private agencyRepo: AgencyRepository,
    private tripRepository: TripRepository,
    private calendarRepo: CalendarRepository,
    private calendarDateRepo: CalendarDateRepository,
    private stopTimeRepo: StopTimeRepository,
    private serviceService: ServiceService,
  ) { }

  create(remoteUid: Remote['uid'], data: GTFS.Trip): Trip {
    const tripEntity = this.tripRepository.create({ id: data.id })
    tripEntity.routeId = data.routeId
    tripEntity.serviceId = data.serviceId
    tripEntity.headsign = data.headsign
    tripEntity.shortName = data.shortName
    tripEntity.directionId = data.directionId
    tripEntity.blockId = data.blockId
    tripEntity.shapeId = data.shapeId
    tripEntity.wheelchairSccessible = data.wheelchairSccessible
    tripEntity.bikesSllowed = data.bikesSllowed

    return tripEntity
  }

  @Transactional()
  async getUidOnly(remoteUid: Remote['uid'], id: Trip['id']) {
    const shapes = await this.tripRepository.findOneByRemoteUidAndId(
      remoteUid,
      id,
      {
        select: ['uid'],
      },
    )

    return shapes
  }

  // NOTE: ManyToMany用、本来はcreateQueryBuilder使ってDB側だけで済ませたい
  @Transactional()
  async save(entity: Parameters<TripRepository['save']>[0]) {
    return this.tripRepository.save(entity, { reload: false })
  }

  @Transactional()
  async bulkUpsert(entities: Trip[], updateEntity = false) {
    return this.tripRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.tripRepository.getUniqueColumns,
        overwrite: [...this.tripRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async linkRoute(...args: Parameters<StopTimeRepository['linkTrip']>) {
    return this.tripRepository.linkRoute(...args)
  }

  @Transactional()
  async getAll(
    remoteUId: Remote['uid'],
    relations: string[],
    order?: { [k: string]: 'ASC' | 'DESC' },
  ) {
    return this.tripRepository.find({
      relations,
      order,
      where: {
        remote: {
          uid: remoteUId,
        },
      },
    })
  }

  @Transactional()
  async count(remoteUid: Remote['uid']) {
    return this.tripRepository.count({
      where: {
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  @Transactional()
  async findOneByUid(
    uid: Trip['uid'],
    relations: (keyof Trip | string)[] = [],
  ) {
    return this.tripRepository.findOne({
      relations,
      where: {
        uid,
      },
    })
  }

  @Transactional()
  async getStopTimeCounts(
    remoteUid: Remote['uid'],
  ): Promise<
    (Trip & {
      stopTimeCount: number
    })[]
  > {
    const rows = await this.tripRepository
      .createQueryBuilder('trip')
      .select('trip.*')
      .addSelect('count(stopTime.uid)', 'stopTimeCount')
      .leftJoin('stop_time', 'stopTime', 'stopTime.tripUid = trip.uid')
      .where('trip.remoteUid = :remoteUid', { remoteUid })
      .andWhere('trip.shapeId is not null')
      .groupBy('stopTime.tripUid')
      .getRawMany()

    rows.forEach(row => {
      row.stopTimeCount = Number(row.stopTimeCount)
    })

    return rows
  }

  @Transactional()
  async findRoutes(
    remoteUid: Remote['uid'],
    args:
      | {
        startDate?: dayjs.Dayjs
        tripId: string
      }
      | {
        routeId: string
        firstStop: {
          date?: {
            departure: dayjs.Dayjs
          }
        }
      },
  ) {
    const timezone = await this.agencyRepo.getTimezoneByRemoteUid(remoteUid)

    const startDate =
      ('tripId' in args ? args.startDate : args.firstStop.date.departure) ||
      dayjs()

    const serviceIds = await this.serviceService.findServiceIds(remoteUid, startDate)

    if (serviceIds.length === 0)
      throw new NotFoundException("There's no service ID.")

    let trips: Trip[]

    if ('tripId' in args) {
      const trip = await this.tripRepository.findOneByRemoteUidAndId(
        remoteUid,
        args.tripId,
      )
      if (trip === undefined) throw new NotFoundException("There's no trip.")

      trips = [trip]
    } else {
      if (args.firstStop.date === undefined) {
        // NOTE: routeIdに紐付いているtripを全て取得する(静的データAPI用)
        trips = await this.tripRepository.findByRemoteUidAndServiceIdAndRouteId(
          remoteUid,
          serviceIds,
          args.routeId,
        )
      } else {
        // NOTE: routeIdとstart_timeの組み合わせでtripを算出する
        const dbTrips = await this.tripRepository.findByRemoteUidAndServiceIdAndRouteId(
          remoteUid,
          serviceIds,
          args.routeId,
        )

        const firstStop = await this.stopTimeRepo.findOneByRemoteUidsAndTripUidsAndTime(
          remoteUid,
          dbTrips.map(({ uid }) => uid),
          { departureTime: args.firstStop.date.departure.tz(timezone) },
          1,
          ['trip'],
        )

        trips = [firstStop.trip]
      }
    }

    const routes = await Promise.all(
      trips.map(async trip => {
        const stopTimes = await this.stopTimeRepo.findByRemoteUidAndTripUid(
          remoteUid,
          trip.uid,
          'ASC',
          { relations: ['stop'] },
        )

        const calcStops = stopTimes.map(stopTime => ({
          ...stopTime.stop,
          sequence: stopTime.sequence,
          date: {
            arrival: {
              schedule: h24ToLessH24(
                stopTime.arrivalTime.tz(timezone),
                startDate,
              ),
            },
            departure: {
              schedule: h24ToLessH24(
                stopTime.departureTime.tz(timezone),
                startDate,
              ),
            },
          },
          location: '', // stopTime.stop.public.location,
          headsign: stopTime.headsign || trip.headsign,
          direction: trip.directionId,
        }))

        return { trip, calcStops }
      }),
    )

    if (routes.length === 0) throw new NotFoundException("There's no trip.")

    return _.compact(routes)
  }
}
