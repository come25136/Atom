import * as GTFS from '@come25136/gtfs'
import * as createHttpError from 'http-errors'
import { momentToDB } from 'src/util'
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Remote } from '../remote/remote.entity'
import { Trip } from '../trip/trip.entity'

@Entity()
@Index(['remote', 'id'])
export class Shape extends BaseEntity {
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
    transformer: momentToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: moment.Moment

  @Column('geometry', {
    transformer: {
      from: (v: string): GTFS.Location => {
        const [lat, lon] = v
          .split('(')[1]
          .split(')')[0]
          .split(' ')

        return { lat: Number(lat), lon: Number(lon) }
      },
      to: (v: GTFS.Location): string => `POINT(${v.lat} ${v.lon})`,
    },
  })
  location: GTFS.Location

  @Column('int')
  sequence: GTFS.Shape['sequence']

  @Column('int', { nullable: true, default: null })
  distTraveled: GTFS.Shape['distTraveled'] = null

  @ManyToMany(
    () => Trip,
    ({ shapes }) => shapes,
  )
  trips: Trip[]

  static async geoJson(
    remoteUid: Remote['uid'],
    args: { tripId: string } | { routeId: string },
  ): Promise<{
    id: string
    type: 'LineString'
    coordinates: [number, number][]
  }> {
    const trip = await Trip.findOne(
      'tripId' in args
        ? { remote: { uid: remoteUid }, id: args.tripId }
        : { remote: { uid: remoteUid }, routeId: args.routeId },
      { relations: ['shapes'] },
    )
    if (trip === undefined) throw createHttpError(404, "There's no such route.")

    return {
      id: trip.routeId,
      type: 'LineString',
      coordinates: trip.shapes.map(({ location }) => [
        location.lon,
        location.lat,
      ]),
    }
  }
}
