import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Remote } from './remote.entity'
import { StopTime } from '@come25136/gtfs'

@Entity()
export class Translation {
  @ManyToOne(
    () => Remote,
    ({ translations }) => translations,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  tableName: 'agency' | 'stops' | 'routes' | 'trips' | 'stop_times' | 'feed_info'

  @Column('varchar')
  fieldName: string

  @Column('varchar')
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
