import * as GTFS from '@come25136/gtfs'
import { momentToDB } from 'src/util'
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
export class Level extends BaseEntity {
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
    transformer: momentToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: moment.Moment

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
