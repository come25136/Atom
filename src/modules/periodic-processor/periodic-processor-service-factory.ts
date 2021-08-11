import { HttpService, Injectable } from '@nestjs/common'
import { GtfsRealtimeService } from '../gtfs-realtime/gtfs-realtime.service'
import { GtfsRealtimeVehiclePeriodicProcessorService } from './gtfs-realtime-vehicle-periodic-processor.service'
import { Remote } from 'src/database/tables/remote/remote.entity'
import { VehicleService } from '../vehicle/vehicle.service'
import { VehicleServiceFactory } from '../vehicle/vehicle-service-factory'

interface Events {
  update: (vehicles: VehicleService[]) => void
}

@Injectable()
class PeriodicProcessorServiceFactory {
  constructor(
    private httpService: HttpService,
    private gtfsRealtimeService: GtfsRealtimeService,
    private vehicleServiceFactory: VehicleServiceFactory,
  ) {}

  create(
    remoteUid: Remote['uid'],
    type?: PeriodicProcessorServiceFactory.createType,
  ): GtfsRealtimeVehiclePeriodicProcessorService {
    switch (type) {
      default:
      case PeriodicProcessorServiceFactory.createType.GTFSRT:
        const service = new GtfsRealtimeVehiclePeriodicProcessorService(
          this.httpService,
          this.gtfsRealtimeService,
          this.vehicleServiceFactory,
          remoteUid,
        )

        return service
    }
  }
}

namespace PeriodicProcessorServiceFactory {
  export enum createType {
    GTFSRT,
  }
}

export { PeriodicProcessorServiceFactory }
