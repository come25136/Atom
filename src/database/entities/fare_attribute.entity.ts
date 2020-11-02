import * as GTFS from '@come25136/gtfs'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { ISO4217 } from 'src/util'

import { Agency } from './agency.entity'
import { FareRule } from './fare_rule.entity'
import { Remote } from './remote.entity'

@Entity()
@Unique(['remote', 'id'])
export class FareAttribute extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ fareAttributes }) => fareAttributes,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  id: GTFS.FareAttribute['fareId']

  @Column({
    type: 'enum',
    enum: ISO4217,
  })
  currencyType: ISO4217

  @Column('int')
  paymentMethod: GTFS.FareAttribute['paymentMethod']

  @Column('int', { nullable: true, default: null })
  transfers: GTFS.FareAttribute['transfers'] = null

  @Column('varchar', { nullable: true, default: null })
  agencyId: string | null = null

  @ManyToOne(
    () => Agency,
    ({ fareAttributes }) => fareAttributes,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  agency: Agency

  @Column('int', { nullable: true, default: null })
  transferDuration: number = null

  @OneToMany(
    () => FareRule,
    ({ fareAttribute }) => fareAttribute,
  )
  fareRules: FareRule[]
}
