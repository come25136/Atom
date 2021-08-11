import * as GTFS from '@come25136/gtfs'
import * as dayjs from 'dayjs'
import * as createHttpError from 'http-errors'
import { dayjsToDB } from 'src/util'
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Remote } from '../remote/remote.entity'
import { Stop } from '../stop/stop.entity'
import { Trip } from '../trip/trip.entity'

// NOTE: stopに一番近いgeo(算出)を入れておく用
@Entity()
@Index(['remote', 'id'])
export class ShapeFromStop  {
  @ManyToOne(
    () => Remote,
    ({ shapes }) => shapes,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

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

  @OneToOne(() => Stop)
  stop: Stop

  @Column('float')
  sequence: GTFS.Shape['sequence']

  @ManyToMany(
    () => Trip,
    ({ shapes }) => shapes,
  )
  trips: Trip[]

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
