import { Bounds, Location } from 'src/util'
import { Between, EntityRepository } from 'typeorm'

import { BaseRepository } from '../base/base.repository'

import { Remote } from '../remote/remote.entity'
import { Stop } from './stop.entity'

@EntityRepository(Stop)
export class StopRepository extends BaseRepository<Stop> {
  async findByRemoteUidsAndBBox(remoteUid: Remote['uid'], bounds: Bounds, options?: { skip?: number, limit?: number }): Promise<Stop[]> {
    const stops = await this
      .createQueryBuilder('s')
      .leftJoinAndMapOne('s.remote', Remote, 'r', 'r.uid = s.remoteUid')
      .where('s.remoteUid = :remoteUid')
      .andWhere(
        "ST_Contains(ST_GEOMFROMTEXT('POLYGON((:west :north, :east :north, :east :south, :west :south, :west :north))'), `s`.`location`)",
      )
      .setParameters({
        remoteUid,
        north: bounds.north,
        east:bounds.east,
        south: bounds.south,
        west: bounds.west,
      })
      .getMany()

    return stops
  }
}
