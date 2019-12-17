import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { FareAttribute } from './fare_attribute'

@Entity()
export class Country extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('char', { unique: true, length: 3 })
  readonly priceCode: string

  @OneToMany(
    () => FareAttribute,
    ({ country }) => country
  )
  fareAttributes: FareAttribute
}
