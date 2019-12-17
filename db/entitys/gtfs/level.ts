import * as GTFS from '@come25136/gtfs'
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { Remote } from './remote'
import { Stop } from './stop'

@Entity()
export class Level extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ levels }) => levels,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  id: GTFS.Level['id']

  @Column('int')
  index: GTFS.Level['index']

  @Column('varchar')
  name: GTFS.Level['name']

  @OneToMany(
    () => Stop,
    ({ level }) => level
  )
  stops: Stop[]
}
