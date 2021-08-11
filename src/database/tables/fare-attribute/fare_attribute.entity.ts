import * as GTFS from '@come25136/gtfs'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { ISO4217, dayjsToDB } from 'src/util'

import { Agency } from '../agency/agency.entity'
import { FareRule } from '../fare-rule/fare_rule.entity'
import { Remote } from '../remote/remote.entity'
import * as dayjs from 'dayjs'

@Entity()
@Unique(['remote', 'id'])
export class FareAttribute  {
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

  @UpdateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
        onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: dayjs.Dayjs

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
