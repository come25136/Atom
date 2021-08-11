import { Args, ID, Query, Resolver } from "@nestjs/graphql";
import * as HttpError from 'http-errors'

import { Remote as RemoteSchema } from "../../schemas/remote.schema";
import { Stop as StopSchema } from "../../schemas/stop.schema";
import { Bounds as BBoxSchema, Bounds } from "../../schemas/bbox.schema";
import { Location as LocationSchema } from "../../schemas/location.schema";

import { StopService } from 'src/modules/stop/stop.service';
import { PipeRemoteById, PipeRemoteByIds } from "src/modules/remote/remote.pipe";
import { Remote } from "src/database/tables/remote/remote.entity";
import { CrawlStatus } from 'src/database/tables/remote/remote.entity'
import { StopClusterService } from "src/modules/stop-cluster/stop-cluster.service";
import { StopCluster } from "../../schemas/stop-cluster.schema";
import { GraphQLInt } from "graphql";
import { Id } from "../../schemas/_id.schema";
import { NotFoundException } from "@nestjs/common";
import { StopTImetable } from "../../schemas/stop-timetable.schema";
import * as dayjs from "dayjs";


const queueAddFlags = [CrawlStatus.ERROR, CrawlStatus.IMPORTED]

@Resolver(of => [StopSchema.Output])
export class StopResolver {
  constructor(
    private stopService: StopService,
    private stopClusterService: StopClusterService,
  ) { }

  @Query(returns => [StopSchema.Output])
  async stops(@Args('remoteIds', { type: () => [ID] }, PipeRemoteByIds) remotes: Remote[]): Promise<StopSchema.Output[]> {
    const remoteInStops = await Promise.all(remotes.map(async remote => {
      const stops = await this.stopService.findByRemoteUid(remote.uid)

      return stops.map(stop => {
        stop.remote = remote

        return this.stopService.toGraphQLSchema(stop)
      })
    }))

    return remoteInStops.flat()
  }

  @Query(returns => [StopSchema.Output])
  async stopSearchByBounds(
    @Args('remoteIds', { type: () => [ID] }, PipeRemoteByIds) remotes: Remote[],
    @Args('bounds', { type: () => Bounds.Input }) bounds: Bounds.Input,
  ) {
    const remoteInStops = await Promise.all(remotes.map(async remote => {
      const stops = await this.stopService.findByRemoteUidAndBBox(remote.uid, bounds)

      return stops.map(stop => {
        stop.remote = remote

        return this.stopService.toGraphQLSchema(stop)
      })
    }))

    return remoteInStops.flat()
  }

  @Query(returns => [StopCluster.Output])
  async stopClusterSearchByBounds(
    @Args('remoteIds', { type: () => [ID] }, PipeRemoteByIds) remotes: Remote[],
    @Args('bounds', { type: () => Bounds.Input }) bounds: Bounds.Input,
    @Args('zoomLevel', { type: () => GraphQLInt }) zoomLevel: number,
  ) {
    const remoteInStops = await Promise.all(remotes.map(async remote => {
      const stops = await this.stopClusterService.findByRemoteUidAndBBox(remote.uid, bounds, zoomLevel)

      return stops.map(stopClusters => {
        stopClusters.remote = remote

        return this.stopClusterService.toGraphQLSchema(stopClusters)
      })
    }))

    return remoteInStops.flat()
  }

  @Query(returns => [StopSchema.Output])
  async nearbyStops(
    @Args('remoteIds', { type: () => [ID] }, PipeRemoteByIds) remotes: Remote[],
    @Args('coordinate', { type: () => LocationSchema.Input }) coordinate: LocationSchema.Input,
    @Args('radius', { type: () => Number }) radius: number
  ): Promise<StopSchema.Output[]> {
    const stops = await this.stopService.findByLocation(
      remotes.map(remote => remote.uid),
      coordinate,
      radius
    )
    const result = stops.map(this.stopService.toGraphQLSchema)

    return result
  }

  @Query(returns => [StopTImetable.Output])
  async stopTimetable(
    @Args('remoteId', { type: () => ID }, PipeRemoteById) remote: Remote,
    @Args('stop', { type: () => Id.Input }) stopId: Id.Input,
  ): Promise<StopTImetable.Output[]> {
    const stop = await this.stopService.findOneByRemoteUidAndId(remote.uid, stopId.id)
    if (stop === undefined) throw new NotFoundException()

    const trips = await this.stopService.timetable(remote.uid, stop.uid, dayjs())

    const timetable = trips.map<StopTImetable.Output>(trip => ({
      trip: {
        id: trip.id
      },
      arrival_time: trip.stopTime.arrivalTime.toISOString(),
      departure_time: trip.stopTime.departureTime.toISOString(),
      headsign: trip.stopTime.headsign ?? trip.headsign,
      pickup_type: trip.stopTime.pickupType,
      drop_off_type: trip.stopTime.dropOffType,
      continuous_pickup: /* trip.stopTime.continuousPickup */ 0,
      continuous_pickup_drop_off: /* trip.stopTime.continuousPickupDropOff*/ 0,
      continuous_drop_off: /* trip.stopTime.continuousDropOff*/ 0,
      shape_dist_traveled: trip.stopTime.shapeDistTraveled || 0,
      timepoint: trip.stopTime.timepoint,
    }))

    return timetable
  }
}
