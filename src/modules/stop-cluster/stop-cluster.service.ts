import * as GTFS from '@come25136/gtfs'
import { BadRequestException, Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'
import * as GeoHash from 'ngeohash'

import { Remote } from 'src/database/tables/remote/remote.entity'
import { StopCluster } from 'src/database/tables/stop-cluster/stop-cluster.entity'
import { StopClusterRepository } from 'src/database/tables/stop-cluster/stop-cluster.repository'
import { Stop } from 'src/database/tables/stop/stop.entity'
import { Bounds } from 'src/util'

import { Geometry } from 'src/interfaces/geometry'

@Injectable()
export class StopClusterService {
  constructor(private stopClusterRepository: StopClusterRepository) { }

  create(data: { zoom: { level: number }, location: GTFS.Location }) {
    if ((0 <= data.zoom.level && data.zoom.level <= 22) === false) {
      throw new BadRequestException()
    }

    const stopClusterEntity = this.stopClusterRepository.create()
    stopClusterEntity.zoomLevel = data.zoom.level
    stopClusterEntity.location = data.location
    stopClusterEntity.geohash = GeoHash.encode(data.location.lat, data.location.lon, 9)

    return stopClusterEntity
  }

  @Transactional()
  async save(entities: StopCluster[]) {
    return this.stopClusterRepository.save(entities)
  }

  @Transactional()
  async upsert(entities: StopCluster[]) {
    return this.stopClusterRepository
      .createQueryBuilder()
      .relation(Stop, 'stops')
      .insert()
      .orUpdate({
        conflict_target: this.stopClusterRepository.getUniqueColumns,
        overwrite: [...this.stopClusterRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(false)
      .execute()
  }

  @Transactional()
  async findAllByRemoteUid(remoteUid: Remote['uid']) {
    return this.stopClusterRepository.find({
      where: {
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  @Transactional()
  async findOneByRemoteUid(remoteUid: Remote['uid']): Promise<StopCluster[]> {
    return this.stopClusterRepository.find({
      where: {
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  @Transactional()
  async findOneByRemoteUidAndZoomLevelAndGeohash(remoteUid: Remote['uid'], zoomLevel: StopCluster['zoomLevel'], geohash: StopCluster['geohash']): Promise<StopCluster> {
    return this.stopClusterRepository.findOne({
      where: {
        remote: {
          uid: remoteUid,
        },
        zoomLevel,
        geohash
      },
    })
  }

  @Transactional()
  async findByRemoteUidAndBBox(remoteUid: Remote['uid'], bbox: Bounds, zoomLevel: number, options?: { skip?: number, limit?: number }): Promise<StopCluster[]> {
    const stopClusters = await this.stopClusterRepository.findByRemoteUidsAndBBox(remoteUid, bbox, zoomLevel, options)

    return stopClusters
  }

  toGraphQLSchema(stopCluster: StopCluster) {
    return {
      id: stopCluster.uid,
      location: {
        lat: stopCluster.location.lat,
        lon: stopCluster.location.lon,
      },
      geohash: stopCluster.geohash,
      remote: {
        id: stopCluster.remote.id,
      },
    }
  }

  geohashEncode(location: Geometry.Coordinate): string {
    return GeoHash.encode(location.lat, location.lon, 9)
  }
}
