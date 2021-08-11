import { EntityRepository } from 'typeorm'

import { Agency } from './agency.entity'
import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'

@EntityRepository(Agency)
export class AgencyRepository extends BaseRepository<Agency> {
  async getTimezoneByRemoteUid(remoteUid: Remote['uid']): Promise<string> {
    const agency = await this.findOne({
      where: { remote: { uid: remoteUid } },
    })

    return agency.timezone
  }
}
