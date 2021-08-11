import * as dayjs from 'dayjs'
import { dayjsToDB } from 'src/util'
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

import { Remote } from '../remote/remote.entity'

@Entity()
export class GtfsStatic  {
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
    transformer: dayjsToDB,
  })
  readonly createdAt: dayjs.Dayjs

  @UpdateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
        onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: dayjs.Dayjs

  @Column('text')
  url: string

  @Column('char', { length: 64 })
  latestFetchedHash: string

  @Column('datetime', {
    nullable: false,
    transformer: dayjsToDB,
  })
  latestFetchedDate: dayjs.Dayjs
}
