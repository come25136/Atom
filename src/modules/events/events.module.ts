import { Module, forwardRef } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from '../auth/auth.guard'
import { EventsGateway } from './events.gateway'
import { PeriodicProcessorModule } from '../periodic-processor/periodic-processor.module'
import { RemoteModule } from '../remote/remote.module'

@Module({
  imports: [
    forwardRef(() => RemoteModule),
    PeriodicProcessorModule,
    RemoteModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    EventsGateway,
  ],
})
export class EventsModule {}
