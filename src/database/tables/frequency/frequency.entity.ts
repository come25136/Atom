import * as GTFS from '@come25136/gtfs'
import * as moment from 'moment-timezone'
import { momentToDB } from 'src/util'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { Remote } from '../remote/remote.entity'
import { Trip } from '../trip/trip.entity'

@Entity()
@Unique(['remote', 'tripId', 'startTime', 'endTime'])
export class Frequency extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ frequencies }) => frequencies,
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

  @Column('varchar', { nullable: true, default: null })
  tripId: string | null = null

  @ManyToOne(
    () => Trip,
    ({ frequencies }) => frequencies,
  )
  trip: Trip

  @Column('date', {
    nullable: true,
    transformer: momentToDB,
  })
  startTime: GTFS.Frequency['time']['start'] = null

  @Column('date', {
    nullable: true,
    transformer: momentToDB,
  })
  endTime: GTFS.Frequency['time']['end'] = null

  @Column('int')
  headwaySecs: GTFS.Frequency['headwaySecs']

  @Column('tinyint', { default: 0 })
  exactTimes: GTFS.Frequency['exactTimes'] = 0
}
