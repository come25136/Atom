import * as GTFS from '@come25136/gtfs'
import * as createHttpError from 'http-errors'
import * as dayjs from 'dayjs'

import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { dayjsToDB } from 'src/util'

import { Remote } from '../remote/remote.entity'
import { Stop } from '../stop/stop.entity'
import { Trip } from '../trip/trip.entity'

@Entity()
@Unique(['remote', 'id', 'sequence', 'stop.uid'])
@Index(['remote', 'id'])
export class Shape  {
  @ManyToOne(
    () => Remote,
    ({ shapes }) => shapes,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('boolean', {
    default: false,
  })
  caled: boolean

  @Column('varchar')
  id: GTFS.Shape['id']

  @UpdateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
        onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: dayjs.Dayjs

  @Column('geometry', {
    srid: 4326,
    transformer: {
      from: (v: string): GTFS.Location => {
        const [lon, lat] = v
          .split('(')[1]
          .split(')')[0]
          .split(' ')

        return { lat: Number(lat), lon: Number(lon) }
      },
      to: (v: GTFS.Location): string => `POINT(${v.lon} ${v.lat})`,
    },
  })
  location: GTFS.Location

  @Column('float')
  sequence: GTFS.Shape['sequence']

  @Column('int', { nullable: true, default: null })
  distTraveled: GTFS.Shape['distTraveled'] = null

  @ManyToMany(
    () => Trip,
    ({ shapes }) => shapes,
  )
  trips: Trip[]

  @ManyToOne(
    () => Stop,
    ({ shapes }) => shapes,
  )
  stop: Stop

  // static async geoJson(
  //   remoteUid: Remote['uid'],
  //   args: { tripId: string } | { routeId: string },
  // ): Promise<{
  //   id: string
  //   type: 'LineString'
  //   coordinates: [number, number][]
  // }> {
  //   const trip = await Trip.findOne(
  //     'tripId' in args
  //       ? { remote: { uid: remoteUid }, id: args.tripId }
  //       : { remote: { uid: remoteUid }, routeId: args.routeId },
  //     { relations: ['shapes'] },
  //   )
  //   if (trip === undefined) throw createHttpError(404, "There's no such route.")

  //   const shapes = await trip.shapes

  //   return {
  //     id: trip.routeId,
  //     type: 'LineString',
  //     coordinates: shapes.map(({ location }) => [location.lon, location.lat]),
  //   }
  // }
}
