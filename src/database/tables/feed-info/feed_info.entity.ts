import * as GTFS from '@come25136/gtfs'
import * as dayjs from 'dayjs'
import { dayjsToDB } from 'src/util'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Remote } from '../remote/remote.entity'

@Entity()
export class FeedInfo  {
  @ManyToOne(
    () => Remote,
    ({ feedInfos }) => feedInfos,
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

  @Column('varchar')
  publisherName: GTFS.FeedInfo['publisher']['name']

  @Column('varchar')
  publisherUrl: GTFS.FeedInfo['publisher']['url']

  @Column('varchar')
  lang: GTFS.FeedInfo['lang']

  @Column('date', {
    nullable: true,
    default: null,
    transformer: dayjsToDB,
  })
  startDate: dayjs.Dayjs = null

  @Column('date', {
    nullable: true,
    default: null,
    transformer: dayjsToDB,
  })
  endDate: dayjs.Dayjs = null

  @Column('varchar', { nullable: true, default: null })
  version: GTFS.FeedInfo['version'] = null

  @Column('varchar', { nullable: true, default: null })
  contactEmail: GTFS.FeedInfo['contact']['email'] = null

  @Column('varchar', { nullable: true, default: null })
  contactUrl: GTFS.FeedInfo['contact']['url'] = null
}
