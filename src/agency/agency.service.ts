import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Agency } from 'src/database/entities/agency.entity';
import { Remote } from 'src/database/entities/remote.entity';
import { Translation } from 'src/database/entities/translation.entity';
import { Connection, Repository } from 'typeorm';

@Injectable()
export class AgencyService {
  constructor(
    private connection: Connection,
    @InjectRepository(Agency) private agencyRepository: Repository<Agency>,
  ) { }

  async registration(id: string, hash: string): Promise<Agency> {
    const agency = this.agencyRepository.create({})

    return this.agencyRepository.save(agency)
  }

  async translate(remoteUid: Remote["uid"], agency: Agency, language: string) {
    return this.connection.transaction(async trn => {
      const remote = { uid: remoteUid }

      const translationRepo = trn.getRepository(Translation)

      const name = await translationRepo.findOne({
        where: [{
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          recordId: agency.id
        },
        {
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: agency.name
        }]
      })

      const url = await translationRepo.findOne({
        where: [{
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_url',
          recordId: agency.id
        },
        {
          remote: remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: agency.url
        }]
      })

      const phone = await translationRepo.findOne({
        where: [{
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_phone',
          recordId: agency.id
        },
        {
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: agency.phone
        }]
      })

      const fareUrl = await translationRepo.findOne({
        where: [{
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_fare_url',
          recordId: agency.id
        },
        {
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: agency.fareUrl
        }]
      })

      const email = await translationRepo.findOne({
        where: [{
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_email',
          recordId: agency.id
        },
        {
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: agency.email
        }]
      })

      return {
        uid: agency.uid,
        id: agency.id,
        name: name?.translation ?? agency.name,
        url: url?.translation ?? agency.url,
        timezone: agency.timezone,
        lang: agency.lang,
        phone: phone?.translation ?? agency.phone,
        fareUrl: fareUrl?.translation ?? agency.fareUrl,
        email: email?.translation ?? agency.email
      }
    })
  }
}
