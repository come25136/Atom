import * as GTFS from '@come25136/gtfs'
import * as dayjs from 'dayjs'
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { dayjsToDB } from 'src/util'

import { Remote } from '../remote/remote.entity'
import { Stop } from '../stop/stop.entity'

@Entity()
@Unique(['remote', 'zoomLevel', 'geohash'])
export class StopCluster {
  @ManyToOne(
    () => Remote,
    ({ stopCluster }) => stopCluster,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @UpdateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: dayjs.Dayjs

  // NOTE: 0-22
  @Column('tinyint', { default: 0 })
  zoomLevel = 0

  @Column('geometry', {
    srid: 4326,
    transformer: {
      from: (v: string): GTFS.Location => {
        if (v === null) return null

        const [lon, lat] = v
          .split('(')[1]
          .split(')')[0]
          .split(' ')

        return { lat: Number(lat), lon: Number(lon) }
      },
      to: (v: GTFS.Location) =>
        v === null ? null : `POINT(${v.lon} ${v.lat})`,
    },
  })
  location: GTFS.Location

  @Column('char', {
    nullable: false,
    length: 9,
  })
  geohash: string

  @ManyToMany(
    () => Stop,
    ({ cluster }) => cluster,
  )
  @JoinTable()
  stops: Stop[]
}
