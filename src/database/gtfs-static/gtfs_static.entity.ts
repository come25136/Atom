import * as moment from 'moment'
import { momentToDB } from 'src/util'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Remote } from './remote.entity'

@Entity()
export class GtfsStatic extends BaseEntity {
  @OneToOne(
    () => Remote,
    ({ gtfsStatic }) => gtfsStatic,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn()
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @CreateDateColumn({
    nullable: false,
    transformer: momentToDB,
  })
  readonly createdAt: moment.Moment

  @UpdateDateColumn({
    nullable: false,
    transformer: momentToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: moment.Moment

  @Column('text')
  url: string

  @Column('char', { length: 64 })
  hash: string

  @Column('datetime', {
    nullable: false,
    transformer: momentToDB,
  })
  lastAcquisitionDate: moment.Moment
}
