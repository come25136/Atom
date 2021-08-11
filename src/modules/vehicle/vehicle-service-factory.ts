import * as dayjs from 'dayjs'
import {
  VehicleDriving,
  VehicleDrivingService,
  VehicleNotDriving,
  VehicleNotDrivingService,
} from './vehicle.service'
import { Geometry } from 'src/interfaces/geometry'
import { Injectable } from '@nestjs/common'
import { RemoteService } from '../remote/remote.service'
import { RouteRepository } from 'src/database/tables/route/route.repository'
import { ShapeService } from '../shape/shape.service'
import { Transactional } from 'typeorm-transactional-cls-hooked'
import { TripService } from '../trip/trip.service'
import { VehiclePosition } from 'src/protos/gtfs-realtime_pb'

interface create {
  remoteUid: number
  tripOrRoute:
    | {
        startDate?: dayjs.Dayjs
        tripId: string
      }
    | {
        routeId: string
        firstStop: {
          date: {
            departure: dayjs.Dayjs
          }
        }
      }
  vehicle: {
    delay: number
    bearing?: number
    location: Geometry.Coordinate
    stops: {
      current: {
        sequence: number
        status: keyof VehiclePosition.VehicleStopStatusMap
      }
    }
    descriptors?: {
      id: string
      label: string
      licensePlate: string
    }
  }
}

@Injectable()
export class VehicleServiceFactory {
  constructor(
    private remoteService: RemoteService,
    private shapeService: ShapeService,
    private tripService: TripService,
    // private stopTimeService: StopTimeService,
    private routeRepo: RouteRepository,
  ) {}

  async create(
    remoteUid: create['remoteUid'],
    tripOrRoute: create['tripOrRoute'],
    vehicle: create['vehicle'],
  ): Promise<VehicleDrivingService>
  async create(
    remoteUid: create['remoteUid'],
    tripOrRoute: create['tripOrRoute'],
  ): Promise<VehicleNotDrivingService>
  @Transactional()
  async create(
    remoteUid: create['remoteUid'],
    tripOrRoute: create['tripOrRoute'],
    vehicle?: create['vehicle'],
  ) {
    // TODO: 後でv2移植する
    const startDate = dayjs()

    const [calcTripTime] = await this.tripService.findRoutes(
      remoteUid,
      tripOrRoute,
    )

    const route = await this.routeRepo.findOneByRemoteUidAndTripUid(
      remoteUid,
      calcTripTime.trip.uid,
    )

    const VehicleClass = vehicle ? VehicleDriving : VehicleNotDriving
    const vehicleInstance = new VehicleClass(
      remoteUid,
      startDate,
      {
        uid: route.uid,
        agency: {
          id: route.agencyId,
        },
        id: route.id,
      },
      calcTripTime.trip,
    )

    const vehicleService =
      vehicleInstance instanceof VehicleDriving
        ? new VehicleDrivingService(
            this.remoteService,
            this.tripService,
            // this.stopTimeService,
            vehicleInstance,
            calcTripTime,
          )
        : new VehicleNotDrivingService(
            this.remoteService,
            this.tripService,
            // this.stopTimeService,
            vehicleInstance,
            calcTripTime,
          )

    if (vehicleInstance instanceof VehicleDriving)
      vehicleInstance.update({
        delay: null,
        bearing: vehicle.bearing,
        location: vehicle.location,
        currentStop: {
          status: vehicle.stops.current.status,
          sequence: vehicle.stops.current.sequence,
        },
        descriptors: vehicle.descriptors,
      })

    return vehicleService
  }
}
