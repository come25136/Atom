import * as GTFS from '@come25136/gtfs'
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { Agency } from './agency'
import { Country } from './country'
import { FareRule } from './fare_rule'
import { Remote } from './remote'

@Entity()
export class FareAttribute extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ fareAttributes }) => fareAttributes,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  id: GTFS.FareAttribute['fareId']

  @ManyToOne(
    () => Country,
    ({ fareAttributes }) => fareAttributes,
    { cascade: true }
  )
  country: Country

  @Column('int')
  paymentMethod: GTFS.FareAttribute['paymentMethod']

  @Column('int', { nullable: true })
  transfers: GTFS.FareAttribute['transfers'] = null

  @Column('varchar')
  agencyId: string

  @ManyToOne(
    () => Agency,
    ({ fareAttributes }) => fareAttributes,
    {
      cascade: true,
      onDelete: 'CASCADE'
    }
  )
  agency: Agency

  @Column('int', { nullable: true })
  transferDuration: number = null

  @OneToMany(
    () => FareRule,
    ({ fareAttribute }) => fareAttribute
  )
  fareRules: FareRule[]
}
