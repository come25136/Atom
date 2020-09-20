import * as GTFS from '@come25136/gtfs'
import { Column, Entity, EntityManager, getRepository, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

// import { FareAttribute } from './fare_attribute'
import { Remote } from './remote.entity'
// import { Route } from './route'

@Entity()
@Index(['remote', 'id'])
export class Agency {
  @ManyToOne(
    () => Remote,
    ({ agencies }) => agencies,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar', { nullable: true, default: null })
  id: GTFS.Agency['id']

  @Column('varchar')
  name: GTFS.Agency['name']

  @Column('text')
  url: GTFS.Agency['url']

  @Column('varchar')
  timezone: GTFS.Agency['timezone']

  @Column('varchar', { nullable: true, default: null })
  lang: GTFS.Agency['lang'] = null

  @Column('varchar', { nullable: true, default: null })
  phone: GTFS.Agency['phone'] = null

  @Column('text', { nullable: true, default: null })
  fareUrl: GTFS.Agency['fareUrl'] = null

  @Column('varchar', { nullable: true, default: null })
  email: GTFS.Agency['email'] = null
  /*
    @OneToMany(
      () => Route,
      ({ agency }) => agency
    )
    routes: Route[]
  
    @OneToMany(
      () => FareAttribute,
      ({ agency }) => agency
    )
    fareAttributes: FareAttribute[]
  
    async translate(language: string, trn: EntityManager) {
      const translationRepo = trn.getRepository(Translation)
  
      const name = await translationRepo.findOne({
        where: [{
          remote: this.remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          recordId: this.id
        },
        {
          remote: this.remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: this.name
        }]
      })
  
      const url = await translationRepo.findOne({
        where: [{
          remote: this.remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_url',
          recordId: this.id
        },
        {
          remote: this.remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: this.url
        }]
      })
  
      const phone = await translationRepo.findOne({
        where: [{
          remote: this.remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_phone',
          recordId: this.id
        },
        {
          remote: this.remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: this.phone
        }]
      })
  
      const fareUrl = await translationRepo.findOne({
        where: [{
          remote: this.remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_fare_url',
          recordId: this.id
        },
        {
          remote: this.remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: this.fareUrl
        }]
      })
  
      const email = await translationRepo.findOne({
        where: [{
          remote: this.remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_email',
          recordId: this.id
        },
        {
          remote: this.remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: this.email
        }]
      })
  
      return {
        uid: this.uid,
        id: this.id,
        name: name?.translation ?? this.name,
        url: url?.translation ?? this.url,
        timezone: this.timezone,
        lang: this.lang,
        phone: phone?.translation ?? this.phone,
        fareUrl: fareUrl?.translation ?? this.fareUrl,
        email: email?.translation ?? this.email
      }
    }
    */
}
