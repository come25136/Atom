import * as moment from 'moment'
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
    transformer: {
      from: v => (v === null ? null : moment.utc(v, 'YYYY-MM-DD HH:mm:ss')),
      to: (v: moment.Moment) =>
        moment.isMoment(v)
          ? new Date(
              v
                .clone()
                .utc()
                .format('YYYY-MM-DD HH:mm:ss'),
            )
          : v,
    },
  })
  readonly createdAt: moment.Moment

  @UpdateDateColumn({
    nullable: false,
    transformer: {
      from: v => (v === null ? null : moment.utc(v, 'YYYY-MM-DD HH:mm:ss')),
      to: (v: moment.Moment) =>
        moment.isMoment(v)
          ? new Date(
              v
                .clone()
                .utc()
                .format('YYYY-MM-DD HH:mm:ss'),
            )
          : v,
    },
  })
  readonly updatedAt: moment.Moment

  @Column('text')
  url: string

  @Column('char', { length: 64 })
  hash: string

  @Column('datetime', {
    nullable: false,
    transformer: {
      from: v => (v === null ? null : moment.utc(v, 'YYYY-MM-DD HH:mm:ss')),
      to: (v: moment.Moment) =>
        moment.isMoment(v)
          ? new Date(
              v
                .clone()
                .utc()
                .format('YYYY-MM-DD HH:mm:ss'),
            )
          : v,
    },
  })
  lastAcquisitionDate: moment.Moment
}
