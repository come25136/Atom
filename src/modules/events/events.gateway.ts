import * as cliProg from 'cli-progress'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Inject, NotFoundException, UseFilters, UsePipes } from '@nestjs/common'
import {
  VehicleDrivingService,
  VehicleService,
} from '../vehicle/vehicle.service'
import { EventEmitter } from 'events'
import { PeriodicProcessorServiceFactory } from '../periodic-processor/periodic-processor-service-factory'
import { PipeRemoteById } from '../remote/remote.pipe'
import { Socket } from 'socket.io'
import StrictEventEmitter from 'strict-event-emitter-types'
import { WsErrorFilter } from 'src/filters/ws-error.filter'
import { RemoteService } from '../remote/remote.service'
import { REDIS_PUB_SUB_TOKEN, RedisPubSub } from 'nestjs-graphql-redis-subscriptions'
import { ModeDecoratores } from 'src/util'

// interface Events {
//   [remoteUid: string]: (vehicles: any) => void
// }

// @UseFilters(WsErrorFilter)
// @WebSocketGateway()
export class EventsGateway
  implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
  // private vehicleEmitter: StrictEventEmitter<
  //   EventEmitter,
  //   Events
  // > = new EventEmitter()

  constructor(
    private realtimeVehiclePeriodicProcessorServiceFactory: PeriodicProcessorServiceFactory,
    private remoteService: RemoteService,
    @Inject(REDIS_PUB_SUB_TOKEN) private pubSub: RedisPubSub,
  ) {
    this.init()
  }

  @ModeDecoratores.DataUpdater(false)
  private async init() {
    const rVPPS = this.realtimeVehiclePeriodicProcessorServiceFactory.create(1)

    rVPPS.event.on('update', async vehicles => {
      // for (const vehicle of vehicles) {
      //   if (vehicle instanceof VehicleDrivingService) {
      //     const bar = new cliProg.SingleBar(
      //       { format: `${vehicle.licensePlate} {bar} {percentage}%` },
      //       cliProg.Presets.shades_classic,
      //     )
      //     bar.start(1, await vehicle.progress())
      //     bar.stop()
      //   }
      // }

      const publicVehiclesPromise = vehicles.map(async v => {
        if (v instanceof VehicleDrivingService) {
          return {
            remote: { id: 'unobus.co.jp' },
            descriptors: {
              id: v.id,
              label: v.label,
              licensePlate: v.licensePlate,
            },
            location: v.location,
            progress:
              Math.floor((await v.progress()) * 100 * Math.pow(10, 2)) /
              Math.pow(10, 2),
          }
        }
      })

      const pVs = await Promise.all(publicVehiclesPromise)

      this.pubSub.publish('vehicles',
        pVs.filter(v => v !== undefined),
      )
    })

    rVPPS.start()
  }

  handleConnection(socket: Socket) {
    // console.log(socket)
  }

  handleDisconnect(socket: Socket) { }

  // @UseGuards(AuthGuard)
  // @UsePipes(PipeRemoteById)
  // @SubscribeMessage('subscribe')
  // async onEvent(
  //   @MessageBody() data: any,
  //   @ConnectedSocket() client: Socket,
  // ): Promise<{ success: true }> {
  //   const remote = await this.remoteService.findOneByRemoteId(data.id)

  //   if (remote === undefined) throw new NotFoundException()

  //   // FIXME: remote.uid
  //   this.vehicleEmitter.on(0, vehicles => {
  //     client.emit('vehicle', vehicles)
  //   })

  //   return {
  //     success: true,
  //   }
  // }
}
