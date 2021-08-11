import { HttpModule, Module } from '@nestjs/common'
import { GtfsRealtimeModule } from '../gtfs-realtime/gtfs-realtime.module'
import { VehicleModule } from '../vehicle/vehicle.module'
import { PeriodicProcessorServiceFactory } from './periodic-processor-service-factory'
import { PeriodicProcessorService } from './periodic-processor.service'

@Module({
  imports: [HttpModule, GtfsRealtimeModule, VehicleModule],
  providers: [PeriodicProcessorServiceFactory],
  exports: [PeriodicProcessorServiceFactory],
})
export class PeriodicProcessorModule {}
