import * as GTFS from '@come25136/gtfs'
import * as geolib from 'geolib'
import { GeolibInputCoordinates } from 'geolib/es/types'
import { Injectable, NotFoundException } from '@nestjs/common'
import { Between, FindManyOptions } from 'typeorm'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { AgencyService } from '../agency/agency.service'
import { Geometry } from 'src/interfaces/geometry'
import { Remote } from 'src/database/tables/remote/remote.entity'
import { Stop } from 'src/database/tables/stop/stop.entity'
import { StopRepository } from 'src/database/tables/stop/stop.repository'

import circleToPolygon from 'circle-to-polygon'
import { Bounds, h24ToLessH24, Location } from 'src/util'
import { ServiceService } from '../service/service.service'
import * as dayjs from 'dayjs'
import { Trip } from 'src/database/tables/trip/trip.entity'
import { StopTime } from 'src/database/tables/stop-time/stop_time.entity'
import { TripRepository } from 'src/database/tables/trip/trip.repository'

@Injectable()
export class StopService {
  constructor(
    private agencyService: AgencyService,
    private serviceService: ServiceService,
    private stopRepository: StopRepository,
    private tripRepository: TripRepository,
  ) { }

  create(remoteUid: Remote['uid'], data: GTFS.Stop): Stop {
    const agencyEntity = this.stopRepository.create({ id: data.id })
    agencyEntity.name = data.name
    agencyEntity.code = data.code
    agencyEntity.name = data.name
    agencyEntity.description = data.description
    agencyEntity.location = data.location
    agencyEntity.zoneId = data.zone.id
    agencyEntity.url = data.url
    agencyEntity.locationType = data.location.type
    agencyEntity.parentStation = data.parentStation
    agencyEntity.timezone = data.timezone
    agencyEntity.wheelchairBoarding = data.wheelchairBoarding
    agencyEntity.levelId = data.level.id
    agencyEntity.platformCode = data.platformCode

    return agencyEntity
  }

  @Transactional()
  async bulkUpsert(entities: Stop[], updateEntity = false) {
    return this.stopRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.stopRepository.getUniqueColumns,
        overwrite: [...this.stopRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async findByRemoteUid(remoteUid: Remote['uid'], options?: { skip?: number, limit?: number }): Promise<Stop[]> {
    const { timezone } = await this.agencyService.findOneByRemoteUid(remoteUid)

    const stops = await this.stopRepository.find({
      where: {
        remote: {
          uid: remoteUid,
        },
      },
      ...options
    })

    const mergedStops = stops.map(stop => ({ ...stop, timezone }))

    return mergedStops
  }

  @Transactional()
  async findOneByRemoteUidAndId(remoteUid: Remote['uid'], stopId: Stop['id']) {
    return this.stopRepository.findOneByRemoteUidAndId(remoteUid, stopId)
  }

  @Transactional()
  async findSWByRemoteUid(remoteUid: Remote['uid']) {
    const lon = await this.stopRepository.createQueryBuilder()
      .addSelect('X(location)', 'lon')
      .where({ remote: { uid: remoteUid } })
      .orderBy('lon', 'ASC')
      .getOne()
    const lat = await this.stopRepository.createQueryBuilder()
      .addSelect('Y(location)', 'lat')
      .where({ remote: { uid: remoteUid } })
      .addOrderBy('lat', 'ASC')
      .getOne()

    return { lon: lon.location.lon, lat: lat.location.lat }
  }

  @Transactional()
  async findNEByRemoteUid(remoteUid: Remote['uid']) {
    const lon = await this.stopRepository.createQueryBuilder()
      .addSelect('X(location)', 'lon')
      .where({ remote: { uid: remoteUid } })
      .orderBy('lon', 'DESC')
      .getOne()
    const lat = await this.stopRepository.createQueryBuilder()
      .addSelect('Y(location)', 'lat')
      .where({ remote: { uid: remoteUid } })
      .addOrderBy('lat', 'DESC')
      .getOne()

    return { lon: lon.location.lon, lat: lat.location.lat }
  }

  @Transactional()
  async findByRemoteUidAndBBox(remoteUid: Remote['uid'], bbox: Bounds, options?: { skip?: number, limit?: number }): Promise<Stop[]> {
    const { timezone } = await this.agencyService.findOneByRemoteUid(remoteUid)

    const stops = await this.stopRepository.findByRemoteUidsAndBBox(remoteUid, bbox, options)

    const mergedStops = stops.map(stop => ({ ...stop, timezone }))

    return mergedStops
  }

  @Transactional()
  async findByLocation(
    remoteUids: Remote['uid'][],
    coordinate: Geometry.Coordinate,
    radius = 20,
  ) {
    // const circlePolygon = circleToPolygon([coordinate.lon, coordinate.lat], 100)

    const stops = await this.stopRepository
      .createQueryBuilder('s')
      .where('remoteUid IN(:...remoteUids)')
      .andWhere(
        "ST_WITHIN(`s`.`location`, ST_GeomFromText(ST_ASTEXT(ST_Buffer(ST_GEOMFROMTEXT('POINT(:lon :lat)', 4326), :radius * 0.00000898315)), 4326))",
      ) // 180 / 3.141592653589793 / 6378137 = 0.00000898315
      .leftJoinAndMapOne('s.remote', Remote, 'r', 'r.uid = s.remoteUid')
      .setParameters({
        remoteUids,
        ...coordinate,
        radius,
      })
      .getMany()

    const sortedStops = geolib.orderByDistance(
      coordinate,
      stops.map(s => ({
        lat: s.location.lat,
        lon: s.location.lon,
        data: s,
      })),
    ) as (GeolibInputCoordinates & { data: Stop })[]

    return sortedStops.map(({ data: stop }) => stop)
  }

  @Transactional()
  async timetable(remoteUid: Remote['uid'], stopUid: Stop['uid'], date: dayjs.Dayjs) {
    const serviceIds = await this.serviceService.findServiceIds(remoteUid, date)

    if (serviceIds.length === 0) throw new NotFoundException('There\'s no service ID.')

    const trips = (await this.tripRepository
      .createQueryBuilder('trip')
      .innerJoinAndMapOne(
        'trip.stopTime',
        'trip.stopTimes',
        'stop_time',
        'trip.remoteUid = :remoteUid AND `trip`.`id` = `stop_time`.`tripId` AND trip.serviceId IN (:...serviceIds) AND `stop_time`.`stopUid` = :stopUid',
        {
          remoteUid,
          serviceIds,
          stopUid
        }
      )
      .getMany()) as (Trip & { stopTime: StopTime })[]

    trips.sort((a, b) => a.stopTime.departureTime.isBefore(b.stopTime.departureTime) ? -1 : 1)

    return trips
  }

  toGraphQLSchema(stop: Stop) {
    return {
      id: stop.id,
      code: stop.code,
      name: stop.name,
      description: stop.description,
      url: stop.url,
      timezone: stop.timezone,
      location: {
        type: stop.locationType,
        lat: stop.location.lat,
        lon: stop.location.lon,
      },
      parentStation: {
        id: stop.platformCode,
      },
      wheelchair: {
        boarding: stop.wheelchairBoarding,
      },
      zone: {
        id: stop.zoneId,
      },
      level: {
        id: stop.levelId,
      },
      platform: {
        code: stop.platformCode,
      },
      remote: {
        id: stop.remote.id,
      },
    }
  }
}
