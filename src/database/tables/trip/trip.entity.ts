import * as GTFS from '@come25136/gtfs'
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { momentToDB } from 'src/util'

import { Attribution } from '../attribution/attribution.entity'
import { CalendarDate } from '../calendar-date/calendar_date.entity'
import { Calendar } from '../calendar/calendar.entity'
import { Frequency } from '../frequency/frequency.entity'
import { Remote } from '../remote/remote.entity'
import { Route } from '../route/route.entity'
import { Shape } from '../shape/shape.entity'
import { StopTime } from '../stop-time/stop_time.entity'

@Entity()
@Unique(['remote', 'id', 'routeId', 'serviceId'])
@Index(['remote', 'serviceId'])
export class Trip extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ trips }) => trips,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @UpdateDateColumn({
    nullable: false,
    transformer: momentToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: moment.Moment

  @Column('varchar')
  routeId: GTFS.Trip['routeId']

  @ManyToOne(
    () => Route,
    ({ trips }) => trips,
    { onDelete: 'CASCADE' },
  )
  route: Route

  @Column('varchar')
  serviceId: GTFS.Trip['serviceId']

  @Column('varchar')
  id: GTFS.Trip['id']

  @Column('text', { nullable: true, default: null })
  headsign: GTFS.Trip['headsign'] = null

  @Column('text', { nullable: true, default: null })
  shortName: GTFS.Trip['shortName'] = null

  @Column('tinyint', { nullable: true, default: null })
  directionId: GTFS.Trip['directionId'] = null

  @Column('varchar', { nullable: true, default: null })
  blockId: GTFS.Trip['blockId'] = null

  @Column('varchar', { nullable: true, default: null })
  shapeId: GTFS.Trip['shapeId'] = null

  @ManyToMany(
    () => Shape,
    ({ trips }) => trips,
  )
  @JoinTable()
  shapes: Shape[]

  @Column('tinyint', { nullable: true, default: null })
  wheelchairSccessible: GTFS.Trip['wheelchairSccessible'] = null

  @Column('tinyint', { nullable: true, default: null })
  bikesSllowed: GTFS.Trip['bikesSllowed'] = null

  @OneToMany(
    () => StopTime,
    ({ trip }) => trip,
  )
  stopTimes: StopTime[]

  @ManyToOne(
    () => Calendar,
    ({ trips }) => trips,
  )
  calendar: Calendar

  @ManyToMany(
    () => CalendarDate,
    ({ trips }) => trips,
  )
  calendarDates: CalendarDate[]

  @OneToMany(
    () => Frequency,
    ({ trip }) => trip,
  )
  frequencies: Frequency[]

  @ManyToMany(
    () => Attribution,
    ({ trip }) => trip,
  )
  attributions: Attribution[]

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
      bikesSllowed: this.bikesSllowed,
    }
  }
  /*
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
    trn: EntityManager
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
            arrivalTime: args.firstStop.time.arrival
          })
        if (args.firstStop.time.departure)
          Object.assign(whereBase, {
            departureTime: args.firstStop.time.departure
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
              stopTime.arrivalTime.tz(trip.route.agency.timezone, true),
              standardDate
            )
          },
          departure: {
            schedule: h24ToLessH24(
              stopTime.departureTime.tz(trip.route.agency.timezone, true),
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
  */
}
