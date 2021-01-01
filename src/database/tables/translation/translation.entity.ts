import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { StopTime } from '@come25136/gtfs'

import { momentToDB } from 'src/util'

import { Remote } from '../remote/remote.entity'

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

  @UpdateDateColumn({
    nullable: false,
    transformer: momentToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: moment.Moment

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
