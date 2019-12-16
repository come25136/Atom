import * as GTFS from '@come25136/gtfs'
import * as createHttpError from 'http-errors'
import * as _ from 'lodash'
import * as moment from 'moment-timezone'
import {
  BaseEntity,
  Column,
  Entity,
  EntityManager,
  In,
  JoinTable,
  LessThanOrEqual,
  ManyToMany,
  ManyToOne,
  MoreThanOrEqual,
  OneToMany,
  PrimaryGeneratedColumn,
  Transaction,
  TransactionManager
} from 'typeorm'

import { h24ToLessH24 } from '../../../libs/util'
import { Agency } from './agency'
import { Calendar } from './calendar'
import { CalendarDate } from './calendar_date'
import { Frequency } from './frequency'
import { Remote } from './remote'
import { Route } from './route'
import { Shape } from './shape'
import { Stop } from './stop'
import { StopTime } from './stop_time'

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

@Entity()
export class Trip extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ trips }) => trips,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  routeId: GTFS.Trip['routeId']

  @ManyToOne(
    () => Route,
    ({ trips }) => trips,
    { onDelete: 'CASCADE' }
  )
  route: Route

  @Column('varchar')
  serviceId: GTFS.Trip['serviceId']

  @Column('varchar')
  id: GTFS.Trip['id']

  @Column('text', { nullable: true })
  headsign: GTFS.Trip['headsign'] = null

  @Column('text', { nullable: true })
  shortName: GTFS.Trip['shortName'] = null

  @Column('tinyint', { nullable: true })
  directionId: GTFS.Trip['directionId'] = null

  @Column('varchar', { nullable: true })
  blockId: GTFS.Trip['blockId'] = null

  @Column('varchar', { nullable: true })
  shapeId: GTFS.Trip['shapeId'] = null

  @ManyToMany(
    () => Shape,
    ({ trips }) => trips
  )
  @JoinTable()
  shapes: Shape[]

  @Column('tinyint', { nullable: true })
  wheelchairSccessible: GTFS.Trip['wheelchairSccessible'] = null

  @Column('tinyint', { nullable: true })
  bikesSllowed: GTFS.Trip['bikesSllowed'] = null

  @OneToMany(
    () => StopTime,
    ({ trip }) => trip
  )
  stopTimes: StopTime[]

  @ManyToOne(
    () => Calendar,
    ({ trips }) => trips
  )
  calendar: Calendar

  @ManyToMany(
    () => CalendarDate,
    ({ trips }) => trips
  )
  @JoinTable()
  calendarDates: CalendarDate[]

  @OneToMany(
    () => Frequency,
    ({ trip }) => trip
  )
  frequencies: Frequency[]

  get public(): GTFS.Trip {
    return {
      routeId: this.routeId,
      serviceId: this.serviceId,
      id: this.id,
      headsign: this.headsign,
      shortName: this.shortName,
      directionId: this.directionId,
      blockId: this.blockId,
      shapeId: this.shapeId,
      wheelchairSccessible: this.wheelchairSccessible,
      bikesSllowed: this.bikesSllowed
    }
  }

  static async findServiceIds(
    remoteUid: Remote['uid'],
    date: moment.Moment,
    trn: EntityManager
  ): Promise<string[]> {
    const dateStr = date.clone().utc().format('YYYY-MM-DD')

    const [calendar, calendarDates] = await Promise.all([
      trn.getRepository(Calendar).find({
        remote: { uid: remoteUid },
        startDate: LessThanOrEqual(dateStr),
        endDate: MoreThanOrEqual(dateStr),
        [dayNames[date.day()]]: 1
      }),
      trn.getRepository(CalendarDate).find({ remote: { uid: remoteUid }, date: dateStr })
    ])

    const serviceIds = calendar.map(({ serviceId }) => serviceId)

    calendarDates.forEach(calendarDate => {
      switch (calendarDate.exceptionType) {
        case 1:
          serviceIds.push(calendarDate.serviceId)
          break

        case 2:
          _.pull(serviceIds, calendarDate.serviceId)
      }
    })

    return serviceIds
  }

  static async findRoutes(
    remoteUid: Remote['uid'],
    args:
      | {
        tripId: string
        standardDate?: moment.Moment
      }
      | {
        routeId: string
        firstStop: {
          date: moment.Moment
          time?: {
            arrival?: moment.Moment
          } & {
            departure?: moment.Moment
          } & {
            arrival?: moment.Moment
            departure?: moment.Moment
          }
        }
      },
    @TransactionManager() trn?: EntityManager
  ): Promise<
    {
      trip: Trip
      calcStops: GTFS.RouteStop[]
    }[]
  > {
    const thisRepo = trn.getRepository(this)

    const agency = await trn.getRepository(Agency).findOne({ remote: { uid: remoteUid } })

    const standardDate = 'tripId' in args ? args.standardDate || moment() : args.firstStop.date

    const serviceIds = await this.findServiceIds(
      remoteUid,
      standardDate,
      trn
    )

    if (serviceIds.length === 0) throw createHttpError(404, 'There\'s no service ID.')

    const qb = <T>(where: T) =>
      trn
        .createQueryBuilder(this, 'trip')
        .leftJoinAndMapOne('trip.route', Route, 'route', 'route.uid = trip.routeUid')
        .leftJoinAndMapOne('route.agency', Agency, 'agency', 'agency.uid = route.agencyUid')
        .leftJoinAndMapMany('trip.stopTimes', StopTime, 'stopTime', 'stopTime.tripUid = trip.uid')
        .leftJoinAndMapOne('stopTime.stop', Stop, 'stop', 'stop.uid = stopTime.stopUid')
        .where(where)
        .orderBy({
          'stopTime.sequence': 'ASC'
        })

    let trips: Trip[]

    if ('tripId' in args) {
      const trip = await qb({ remote: { uid: remoteUid }, id: args.tripId }).getOne()

      if (trip === undefined) throw createHttpError(404, 'There\'s no trip.')
      if (trip.stopTimes.length === 0) throw createHttpError(404, 'There\'s trip has no stop time.')

      trips = [trip]
    } else {
      if (args.firstStop.time === undefined) {
        trips = await qb({
          remote: { uid: remoteUid },
          serviceId: In(serviceIds),
          routeId: args.routeId
        }).getMany()
      } else {
        const dbTrips = await thisRepo.find({
          remote: { uid: remoteUid },
          serviceId: In(serviceIds),
          routeId: args.routeId
        })

        const stopTimeRepo = trn.getRepository(StopTime)

        const whereBase = {
          remote: { uid: remoteUid },
          trip: { uid: In(dbTrips.map(({ uid }) => uid)) },
          sequence: 1
        }

        if (args.firstStop.time.arrival)
          Object.assign(whereBase, {
            arrivalTime: args.firstStop.time.arrival.clone().tz(agency.timezone)
          })
        if (args.firstStop.time.departure)
          Object.assign(whereBase, {
            departureTime: args.firstStop.time.departure.clone().tz(agency.timezone)
          })

        const firstStops = await stopTimeRepo.find({
          relations: ['trip'],
          where: whereBase
        })

        trips = await Promise.all(
          firstStops.map(async firstStop =>
            qb({ remote: { uid: remoteUid }, uid: firstStop.trip.uid }).getOne()
          )
        )
      }
    }

    const withRoute = trips.filter(trip => trip.route !== null)

    if (withRoute.length === 0) throw createHttpError(404, 'There\'s trip has no route.')

    const routes = withRoute.map(trip => {
      const calcStops: GTFS.RouteStop[] = trip.stopTimes.map<GTFS.RouteStop>(stopTime => ({
        ...stopTime.stop.public,
        sequence: stopTime.sequence,
        date: {
          arrival: {
            schedule: h24ToLessH24(
              stopTime.arrivalTime.tz(trip.route.agency.timezone),
              standardDate
            )
          },
          departure: {
            schedule: h24ToLessH24(
              stopTime.departureTime.tz(trip.route.agency.timezone),
              standardDate
            )
          }
        },
        location: stopTime.stop.public.location,
        headsign: stopTime.headsign || trip.headsign,
        direction: trip.directionId
      }))

      return { trip, calcStops }
    })

    if (routes.length === 0) throw createHttpError(404, 'There\'s no trip.')

    return _.compact(routes)
  }
}
