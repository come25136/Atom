import * as GTFS from '@come25136/gtfs'
import * as moment from 'moment-timezone'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Country } from './country'
import { Remote } from './remote'

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
    transformer: {
      from: v => (v === null ? null : moment.utc(v, 'YYYY-MM-DD')),
      to: (v: moment.Moment) => (moment.isMoment(v) ? new Date(v.clone().utc().format('YYYY-MM-DD HH:mm:ss')) : v)
    }
  })
  startDate: GTFS.FeedInfo['date']['start'] = null

  @Column('date', {
    nullable: true,
    transformer: {
      from: v => (v === null ? null : moment.utc(v, 'YYYY-MM-DD')),
      to: (v: moment.Moment) => (moment.isMoment(v) ? new Date(v.clone().utc().format('YYYY-MM-DD HH:mm:ss')) : v)
    }
  })
  endDate: GTFS.FeedInfo['date']['end'] = null

  @Column('varchar', { nullable: true })
  version: GTFS.FeedInfo['version']

  @Column('varchar', { nullable: true })
  contactEmail: GTFS.FeedInfo['contact']['email']

  @Column('varchar', { nullable: true })
  contactUrl: GTFS.FeedInfo['contact']['url']
}
