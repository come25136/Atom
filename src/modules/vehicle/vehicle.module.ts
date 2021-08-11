import { Module } from '@nestjs/common'
import { RouteRepository } from 'src/database/tables/route/route.repository'
import { RemoteModule } from '../remote/remote.module'
import { ShapeModule } from '../shape/shape.module'
import { TripModule } from '../trip/trip.module'
import { VehicleServiceFactory } from './vehicle-service-factory'
import {
  VehicleDrivingService,
  VehicleNotDrivingService,
} from './vehicle.service'

@Module({
  imports: [RemoteModule, ShapeModule, TripModule, RouteRepository],
  providers: [
    VehicleServiceFactory,
    VehicleNotDrivingService,
    VehicleDrivingService,
  ],
  exports: [VehicleServiceFactory],
})
export class VehicleModule {}
