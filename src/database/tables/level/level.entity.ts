import * as GTFS from '@come25136/gtfs'
import * as dayjs from 'dayjs'
import { dayjsToDB } from 'src/util'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { Remote } from '../remote/remote.entity'
import { Stop } from '../stop/stop.entity'

@Entity()
@Unique(['remote', 'id'])
export class Level  {
  @ManyToOne(
    () => Remote,
    ({ levels }) => levels,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  id: GTFS.Level['id']

  @UpdateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
        onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: dayjs.Dayjs

  @Column('int')
  index: GTFS.Level['index']

  @Column('varchar')
  name: GTFS.Level['name']

  @OneToMany(
    () => Stop,
    ({ level }) => level,
  )
  stops: Stop[]
}
