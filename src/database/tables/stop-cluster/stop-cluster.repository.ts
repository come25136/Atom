import { Bounds } from 'src/util'
import { EntityRepository } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { StopCluster } from './stop-cluster.entity'

@EntityRepository(StopCluster)
export class StopClusterRepository extends BaseRepository<StopCluster> {
  async findByRemoteUidsAndBBox(remoteUid: Remote['uid'], bounds: Bounds, zoomLevel: number, options?: { skip?: number, limit?: number }): Promise<StopCluster[]> {
    const stops = await this
      .createQueryBuilder('s')
      .leftJoinAndMapOne('s.remote', Remote, 'r', 'r.uid = s.remoteUid')
      .where('s.remoteUid = :remoteUid')
      .andWhere(
        "ST_Contains(ST_GEOMFROMTEXT('POLYGON((:west :north, :east :north, :east :south, :west :south, :west :north))'), `s`.`location`)",
      )
      .andWhere('s.zoomLevel = :zoomLevel')
      .setParameters({
        remoteUid,
        north: bounds.north,
        east: bounds.east,
        south: bounds.south,
        west: bounds.west,
        zoomLevel,
      })
      .getMany()

    return stops
  }
}
