import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { StopTime } from '@come25136/gtfs'

import { Remote } from './remote.entity'

export enum TableName {
  Agency = 1,
  Stops = 2,
  Routes = 3,
  Trips = 4,
  StopTimes = 5,
  FeedInfo = 6,
}

@Entity()
@Unique([
  'remote',
  'tableName',
  'fieldName',
  'language',
  'recordId',
  'recordSubId',
])
@Unique(['remote', 'tableName', 'fieldName', 'language', 'fieldValue'])
export class Translation {
  @ManyToOne(
    () => Remote,
    ({ translations }) => translations,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column({
    type: 'enum',
    enum: TableName,
  })
  tableName: TableName

  @Column('varchar', { length: 20 })
  fieldName: string

  @Column('varchar', { length: 10 })
  language: string

  @Column('text')
  translation: string

  @Column('varchar', { nullable: true, default: null })
  recordId: string | null = null

  @Column('int', { nullable: true, default: null })
  recordSubId: StopTime['sequence'] | null = null

  @Column('varchar', { nullable: true, default: null })
  fieldValue: string | null = null
}