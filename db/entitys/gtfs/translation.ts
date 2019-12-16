import * as GTFS from '@come25136/gtfs'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Remote } from './remote'
import { Stop } from './stop'

@Entity()
export class Translation extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ transfers }) => transfers,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  transId: GTFS.RawTranslation['trans_id']

  @Column('varchar')
  lang: GTFS.RawTranslation['lang']

  @Column('varchar')
  translation: GTFS.RawTranslation['translation']

  @ManyToOne(
    () => Stop,
    ({ translations }) => translations,
    { onDelete: 'CASCADE' }
  )
  stop: Stop
}
