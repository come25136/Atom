import * as GTFS from '@come25136/gtfs'
import * as moment from 'moment-timezone'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Remote } from './remote.entity'

@Entity()
export class FeedInfo extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ feedInfos }) => feedInfos,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  publisherName: GTFS.FeedInfo['publisher']['name']

  @Column('varchar')
  publisherUrl: GTFS.FeedInfo['publisher']['url']

  @Column('varchar')
  lang: GTFS.FeedInfo['lang']

  @Column('date', {
    nullable: true,
    default: null,
    transformer: {
      from: v => (v === null ? null : moment(v, 'YYYY-MM-DD')),
      to: (v: moment.Moment | string) => (moment.isMoment(v) ? new Date(v.format('YYYY-MM-DD HH:mm:ss')) : v)
    }
  })
  startDate: GTFS.FeedInfo['date']['start'] = null

  @Column('date', {
    nullable: true,
    default: null,
    transformer: {
      from: v => (v === null ? null : moment(v, 'YYYY-MM-DD')),
      to: (v: moment.Moment | string) => (moment.isMoment(v) ? new Date(v.format('YYYY-MM-DD HH:mm:ss')) : v)
    }
  })
  endDate: GTFS.FeedInfo['date']['end'] = null

  @Column('varchar', { nullable: true, default: null })
  version: GTFS.FeedInfo['version'] = null

  @Column('varchar', { nullable: true, default: null })
  contactEmail: GTFS.FeedInfo['contact']['email'] = null

  @Column('varchar', { nullable: true, default: null })
  contactUrl: GTFS.FeedInfo['contact']['url'] = null
}
