import { GTFS } from '@come25136/gtfs'
import * as env from 'env-var'
import * as _ from 'lodash'
import * as moment from 'moment-timezone'
import {
  BaseEntity,
  Column,
  Entity,
  EntityManager,
  OneToMany,
  PrimaryGeneratedColumn,
  TransactionManager,
  UpdateDateColumn
} from 'typeorm'

import { debug } from '../../../libs/util'
import { Agency } from './agency'
import { Calendar } from './calendar'
import { CalendarDate } from './calendar_date'
import { Country } from './country'
import { FareAttribute } from './fare_attribute'
import { FareRule } from './fare_rule'
import { FeedInfo } from './feed_info'
import { Frequency } from './frequency'
import { Level } from './level'
import { Pathway } from './pathway'
import { Route } from './route'
import { Shape } from './shape'
import { Stop } from './stop'
import { StopTime } from './stop_time'
import { Transfer } from './transfer'
import { Translation } from './translation'
import { Trip } from './trip'

@Entity()
export class Remote extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar', { unique: true })
  id: string

  @UpdateDateColumn({
    nullable: true,
    transformer: {
      from: v => (v === null ? null : moment.utc(v, 'YYYY-MM-DD HH:mm:ss')),
      to: (v: moment.Moment) => (moment.isMoment(v) ? new Date(v.clone().utc().format('YYYY-MM-DD HH:mm:ss')) : v)
    }
  })
  readonly updatedAt: moment.Moment

  @Column('char', { length: 64 })
  hash: string

  @OneToMany(
    () => Agency,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  agencies: Agency[]

  @OneToMany(
    () => Stop,
    ({ remote }) => remote
  )
  stops: Stop[]

  @OneToMany(
    () => Route,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  routes: Route[]

  @OneToMany(
    () => Trip,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  trips: Trip[]

  @OneToMany(
    () => StopTime,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  stopTimes: StopTime[]

  @OneToMany(
    () => Calendar,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  calendar: Calendar[]

  @OneToMany(
    () => CalendarDate,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  calendarDates: CalendarDate[]

  @OneToMany(
    () => FareAttribute,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  fareAttributes: FareAttribute[]

  @OneToMany(
    () => FareRule,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  fareRules: FareRule[]

  @OneToMany(
    () => Shape,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  shapes: Shape[]

  @OneToMany(
    () => Frequency,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  frequencies: Frequency[]

  @OneToMany(
    () => Transfer,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  transfers: Transfer[]

  @OneToMany(
    () => Pathway,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  pathways: Pathway[]

  @OneToMany(
    () => Level,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  levels: Level[]

  @OneToMany(
    () => FeedInfo,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  feedInfos: FeedInfo[]

  static async import(
    id: string,
    gtfs: GTFS,
    hash: string,
    @TransactionManager() trn?: EntityManager
  ) {
    const take = 1000

    const remoteRepo = trn.getRepository(Remote)

    debug(() => console.time('import'))

    const remote = await remoteRepo.findOne({ id }) || Remote.create({ id })

    remote.hash = hash

    const singleAgencyId: string =
      Object.keys(gtfs.agencies).length === 1 ? gtfs.agencies[0].id : null

    remote.agencies = gtfs.agencies.map(gAgency =>
      Agency.create({ ...gAgency, id: gAgency.id || singleAgencyId })
    )

    remote.frequencies = gtfs.frequencies.map(frequency =>
      Frequency.create({
        ...frequency,
        startTime: frequency.time.start,
        endTime: frequency.time.end
      })
    )

    remote.transfers = gtfs.transfers.map(transfer =>
      Transfer.create({
        ...transfer,
        fromStopId: transfer.stop.from.id,
        toStopId: transfer.stop.to.id,
        minTransferTime: 'time' in transfer ? transfer.time.min : null
      })
    )

    remote.pathways = gtfs.pathways.map(pathway =>
      Pathway.create({
        id: pathway.id,
        fromStopId: pathway.from.stop.id,
        toStopId: pathway.to.stop.id,
        pathwayMode: pathway.pathwayMode,
        isBidirectional: pathway.isBidirectional,
        length: pathway.length,
        traversalTime: pathway.traversalTime,
        stairCount: pathway.stair.count,
        maxSlope: pathway.slope.max,
        minWidth: pathway.width.min,
        signpostedAs: pathway.signpostedAs,
        reversedSignpostedAs: pathway.reversedSignpostedAs
      })
    )

    remote.levels = gtfs.levels.map(level => Level.create({ ...level }))

    remote.feedInfos = gtfs.feedInfo.map(feedInfo =>
      FeedInfo.create({
        publisherName: feedInfo.publisher.name,
        publisherUrl: feedInfo.publisher.url,
        lang: feedInfo.lang,
        startDate: feedInfo.date.start,
        endDate: feedInfo.date.end,
        version: feedInfo.version,
        contactEmail: feedInfo.contact.email,
        contactUrl: feedInfo.contact.url
      })
    )

    // NOTE: uidを取得するために一回DBに入れる
    const r = await remoteRepo.findOne(await remoteRepo.save(remote))

    const agencyRepo = trn.getRepository(Agency)

    const fareAttributeRepo = trn.getRepository(FareAttribute)

    const fareAttributeEntities = await Promise.all(
      gtfs.fareAttributes.map(async fareAttribute => {
        const [agency, country] = await Promise.all([
          agencyRepo.findOne({
            where: { remote: r, id: fareAttribute.agencyId || singleAgencyId }
          }),
          Country.findOne({ select: ['uid'], where: { priceCode: fareAttribute.currencyType } })
        ])

        if (agency === undefined || country === undefined) return

        return FareAttribute.create({
          ...fareAttribute,
          id: fareAttribute.fareId,
          agency,
          country,
          agencyId: agency.id,
          remote: r
        })
      })
    )

    await fareAttributeRepo.save(_.compact(fareAttributeEntities))

    const routeRepo = trn.getRepository(Route)

    const routeEntities = await Promise.all(
      gtfs.routes.map(async route => {
        const agency = await agencyRepo.findOne({
          select: ['uid'],
          where: { remote: r, id: route.agencyId || singleAgencyId }
        })

        if (agency === undefined) return

        return Route.create({
          ...route,
          shortName: route.name.long,
          longName: route.name.long,
          agency,
          remote: r
        })
      })
    )

    await routeRepo.save(_.compact(routeEntities))

    const calendarRepo = trn.getRepository(Calendar)

    if (env.get('NODE_ENV', 'development').asString() === 'development')
      debug(() => console.time('import calender'))

    const calenderEntries = gtfs.calendar.map(calendar =>
      Calendar.create({
        ...calendar,
        monday: calendar.days.mon,
        tuesday: calendar.days.tues,
        wednesday: calendar.days.wednes,
        thursday: calendar.days.thurs,
        friday: calendar.days.fri,
        saturday: calendar.days.satur,
        sunday: calendar.days.sun,
        startDate: calendar.date.start,
        endDate: calendar.date.end,
        remote: r
      })
    )

    await calendarRepo.save(calenderEntries)

    if (env.get('NODE_ENV', 'development').asString() === 'development')
      console.timeEnd('import calender')

    const calendarDateRepo = trn.getRepository(CalendarDate)

    if (env.get('NODE_ENV', 'development').asString() === 'development')
      debug(() => console.time('import calender date'))

    const calendarDateEntities = gtfs.calendarDates.map(calendarDate =>
      CalendarDate.create({
        ...calendarDate,
        date: calendarDate.date,
        remote: r
      })
    )

    await calendarDateRepo.save(calendarDateEntities)

    if (env.get('NODE_ENV', 'development').asString() === 'development')
      console.timeEnd('import calender date')

    const tripRepo = trn.getRepository(Trip)

    const tripChunks = _.chunk(gtfs.trips, 500)

    debug(() => console.time('import trip'))

    for (const gTrips of tripChunks) {
      const trips = await Promise.all(
        gTrips.map(async trip => {
          const [calendar, route] = await Promise.all([
            calendarRepo.findOne({
              select: ['uid'],
              where: { remote: r, serviceId: trip.serviceId }
            }),
            routeRepo.findOne({ select: ['uid'], where: { remote: r, id: trip.routeId } })
          ])

          return Trip.create({ ...trip, remote: r, calendar, route })
        })
      )

      await tripRepo.save(trips)

      const tripChunks = _.chunk(trips, 50)

      for (const trips of tripChunks) {
        await Promise.all(
          trips.map(async trip => {
            const count = await calendarDateRepo.count({ remote: r, serviceId: trip.serviceId })

            // tslint:disable-next-line: one-variable-per-declaration
            for (let skip = 0; skip < count; skip += take) {
              trip.calendarDates = await calendarDateRepo.find({
                select: ['uid'],
                where: { remote: r, serviceId: trip.serviceId },
                skip,
                take
              })

              await tripRepo.save(trip)
            }
          })
        )
      }
    }

    if (env.get('NODE_ENV', 'development').asString() === 'development')
      console.timeEnd('import trip')

    const levelRepo = trn.getRepository(Level)
    const transferRepo = trn.getRepository(Transfer)
    const stopRepo = trn.getRepository(Stop)

    const stopChunks = _.chunk(gtfs.stops, 1500)

    if (env.get('NODE_ENV', 'development').asString() === 'development')
      debug(() => console.time('import stop'))

    for (const gStops of stopChunks) {
      const stops = await Promise.all(
        gStops.map(async stop => {
          const [level, froms, to] = await Promise.all([
            levelRepo.findOne({ select: ['uid'], where: { remote: r, id: stop.level.id } }),
            transferRepo.find({ select: ['uid'], where: { remote: r, fromStopId: stop.id } }),
            transferRepo.find({ select: ['uid'], where: { remote: r, toStopId: stop.id } })
          ])

          return Stop.create({
            ...stop,
            locationType: stop.location.type,
            zoneId: stop.zone.id,
            levelId: stop.level.id,
            level,
            froms,
            to,
            remote: r
          })
        })
      )

      await stopRepo.save(stops)
    }

    if (env.get('NODE_ENV', 'development').asString() === 'development')
      console.timeEnd('import stop')

    const translationRepo = trn.getRepository(Translation)

    if (env.get('NODE_ENV', 'development').asString() === 'development')
      debug(() => console.time('import translation'))

    for (const [id, langs] of Object.entries(gtfs.translations)) {
      const stop = await stopRepo.findOne({ select: ['uid'], where: { remote: r, name: id } })

      await translationRepo.save(
        Object.entries(langs).map(([lang, translation]) =>
          Translation.create({
            transId: id,
            lang,
            translation,
            stop,
            remote: r
          })
        )
      )
    }

    if (env.get('NODE_ENV', 'development').asString() === 'development')
      console.timeEnd('import translation')

    const stopTimeRepo = trn.getRepository(StopTime)

    const stopTimeChunks = _.chunk(gtfs.stopTimes, 500)

    if (env.get('NODE_ENV', 'development').asString() === 'development')
      debug(() => console.time('import stop time'))

    for (const gStopTimes of stopTimeChunks) {
      const stopTimes = await Promise.all(
        gStopTimes.map(async stopTime => {
          const [trip, stop] = await Promise.all([
            tripRepo.findOne({
              select: ['uid'],
              where: { remote: r, id: stopTime.tripId },
              cache: true
            }),
            stopRepo.findOne({
              select: ['uid'],
              where: { remote: r, id: stopTime.stopId },
              cache: true
            })
          ])

          return StopTime.create({
            ...stopTime,
            arrivalTime: stopTime.time.arrival,
            departureTime: stopTime.time.departure,
            trip,
            stop,
            remote: r
          })
        })
      )

      await stopTimeRepo.save(stopTimes)
    }

    if (env.get('NODE_ENV', 'development').asString() === 'development')
      console.timeEnd('import stop time')

    const shapeRepo = trn.getRepository(Shape)

    const shapeChunks = _.chunk(gtfs.shapes, 500)

    if (env.get('NODE_ENV', 'development').asString() === 'development')
      debug(() => console.time('import shape'))

    for (const gShapeChunks of shapeChunks) {
      await Promise.all(
        gShapeChunks.map(async gShape => {
          const shape = Shape.create({ ...gShape, remote: r })

          const count = await tripRepo.count({ remote: r, shapeId: shape.id })

          for (let skip = 0; skip < count; skip += take) {
            shape.trips = await tripRepo.find({
              select: ['uid'],
              where: { remote: r, shapeId: shape.id },
              skip,
              take
            })

            await shapeRepo.save(shape)
          }
        })
      )
    }

    debug(() => console.timeEnd('import shape'))

    /* 使わないデータなのにインサートに20分ぐらいかかるのでコメントアウト
    const fareRuleChunks = _.chunk(gtfs.fareRules, 2500)
    const fareRuleRepo = trn.getRepository(FareRule)

    for (const fareRules of fareRuleChunks) {
      await fareRuleRepo.save(await Promise.all(fareRules.map(async fareRule => {
        const [route, origin, destination, contain] = await Promise.all([
          routeRepo.findOne({ remote: { uid: r.uid }, id: fareRule.routeId }),
          fareRule.originId === null ? null : stopRepo.findOne({ remote: { uid: r.uid }, zoneId: fareRule.originId }),
          fareRule.destinationId === null ? null : stopRepo.findOne({ remote: { uid: r.uid }, zoneId: fareRule.destinationId }),
          fareRule.containsId === null ? null : stopRepo.findOne({ remote: { uid: r.uid }, zoneId: fareRule.containsId })
        ])

        if (route === undefined) return

        return FareRule.create({
          ...fareRule,
          route,
          origin,
          destination,
          contain,
          remote: r
        })
      })))
    }
    */

    debug(() => console.timeEnd('import'))

    return remote
  }
}
