import * as dayjs from 'dayjs'
import {
  FeedMessage,
  TripUpdate,
  VehiclePosition,
} from 'src/protos/gtfs-realtime_pb.js'
import { HttpService, Injectable, Logger } from '@nestjs/common'
import { Vehicle, VehicleService } from '../vehicle/vehicle.service'
import { EventEmitter } from 'events'
import { FeedType } from 'src/database/tables/gtfs-realtime/gtfs_realtime.entity'
import { GtfsRealtimeService } from '../gtfs-realtime/gtfs-realtime.service'
import { PeriodicProcessorService } from './periodic-processor.service'
import StrictEventEmitter from 'strict-event-emitter-types'
import { VehicleServiceFactory } from '../vehicle/vehicle-service-factory'

interface Events {
  update: (vehicles: VehicleService[]) => void
}

// NOTE: Feedは大体30秒更新なので適当に18秒
// 後で更新間隔の平均取るので中途半端な秒数にしてる
const defaultNextTimeout = 18000

@Injectable()
export class GtfsRealtimeVehiclePeriodicProcessorService extends PeriodicProcessorService {
  private _event: StrictEventEmitter<EventEmitter, Events> = new EventEmitter()
  private latestCelcedData: {
    updatedAt: dayjs.Dayjs | null
    vehicles: Vehicle[]
  } = {
    updatedAt: null,
    vehicles: [],
  }

  constructor(
    private httpService: HttpService,
    private gtfsRealtimeService: GtfsRealtimeService,
    private vehicleServiceFactory: VehicleServiceFactory,
    ...periodicProcessorArgs: AbstractContructorParameters<
      typeof PeriodicProcessorService
    >
  ) {
    super(...periodicProcessorArgs)
  }

  protected updateData(
    vehicles: Vehicle[],
    updatedAt: dayjs.Dayjs,
  ): ThisType<GtfsRealtimeVehiclePeriodicProcessorService> {
    this.latestCelcedData.updatedAt = updatedAt
    this.latestCelcedData.vehicles = vehicles

    Logger.debug(
      `The realtime data of remote UID '${this.remoteUid}' has been updated!!`,
    )

    // this.dataUpdatedCallback(this.remote, this.broadcastVehicles)

    // return this.latestCelcedData.vehicles.map(v => v.public)
    return this
  }

  protected async loop(timeAvg: number) {
    // NOTE: URL変更を想定して毎回DBから取ってくる
    const rtTripEntity = await this.gtfsRealtimeService.findOneByRemoteUidAndFeedType(
      this.remoteUid,
      FeedType.TRIP_UPDATE,
    )
    const rtVehicleEntity = await this.gtfsRealtimeService.findOneByRemoteUidAndFeedType(
      this.remoteUid,
      FeedType.VEHICLE_POSITION,
    )

    const tU = await this.httpService
      .get<Buffer>(rtTripEntity.url, {
        responseType: 'arraybuffer',
      })
      .toPromise()
      .then(({ data }) => FeedMessage.deserializeBinary(data))

    const vP = await this.httpService
      .get<Buffer>(rtVehicleEntity.url, {
        responseType: 'arraybuffer',
      })
      .toPromise()
      .then(({ data }) => FeedMessage.deserializeBinary(data))

    const vPFeedGeneratedTimestamp = dayjs(vP.getHeader().getTimestamp())

    if (
      this.latestCelcedData.updatedAt?.isSame(vPFeedGeneratedTimestamp) ??
      false
    )
      return defaultNextTimeout

    if (vP.getEntityList().length === 0) {
      this.updateData([], vPFeedGeneratedTimestamp)

      return defaultNextTimeout
    }

    if (
      this.latestCelcedData.updatedAt?.isAfter(vPFeedGeneratedTimestamp) ??
      true
    ) {
      const vehicles: VehicleService[] = []

      for (const entity of vP.getEntityList()) {
        const pbVehicle = entity.getVehicle()

        // NOTE: GTFS RT VP的には座標必須だけど念の為
        // https://developers.google.com/transit/gtfs-realtime/reference?hl=ja#message-position
        if (
          pbVehicle.hasPosition() === false ||
          pbVehicle.getPosition().hasLatitude() === false ||
          pbVehicle.getPosition().hasLongitude() === false ||
          pbVehicle.hasTrip() === false
        )
          continue

        const _pbTrip = tU.getEntityList().find(
          entity =>
            entity
              .getTripUpdate()
              .getTrip()
              .getTripId() === pbVehicle.getTrip().getTripId(),
        )

        if (_pbTrip === undefined) continue

        const pbTrip = _pbTrip.getTripUpdate()

        const stopTimeUpdate = pbTrip
          .getStopTimeUpdateList()
          .find(
            sTU =>
              sTU.hasStopSequence() &&
              sTU.getStopSequence() === pbVehicle.getCurrentStopSequence(),
          )
        if (
          stopTimeUpdate === undefined ||
          stopTimeUpdate?.getScheduleRelationship() ===
            TripUpdate.StopTimeUpdate.ScheduleRelationship.NO_DATA ||
          (stopTimeUpdate?.getScheduleRelationship() ===
            TripUpdate.StopTimeUpdate.ScheduleRelationship.SKIPPED &&
            stopTimeUpdate?.hasArrival() === false &&
            stopTimeUpdate.hasDeparture() === false)
        )
          continue

        const tripOrRoute = pbTrip.getTrip().hasTripId()
          ? { tripId: pbTrip.getTrip().getTripId() }
          : {
              routeId: pbTrip.getTrip().getRouteId(),
              firstStop: {
                date: {
                  departure: dayjs(
                    pbTrip.getTrip().getStartDate() +
                      pbTrip.getTrip().getStartTime(),
                    'YYYYMMDDHH:mm:ss',
                  ),
                },
              },
            }

        const vehicle = await this.vehicleServiceFactory.create(
          this.remoteUid,
          tripOrRoute,
          {
            delay: pbTrip.getDelay(),
            location: {
              lat: pbVehicle.getPosition().getLatitude(),
              lon: pbVehicle.getPosition().getLongitude(),
            },
            stops: {
              current: {
                sequence: pbVehicle.getCurrentStopSequence(),
                status:
                  VehiclePosition.VehicleStopStatus[
                    pbVehicle.getCurrentStatus()
                  ],
              },
            },
            descriptors: {
              id: pbVehicle.getVehicle().getId(),
              label: pbVehicle.getVehicle().getLabel(),
              licensePlate: pbVehicle.getVehicle().getLicensePlate(),
            },
          },
        )

        vehicles.push(vehicle)
      }

      this.event.emit('update', vehicles)
    }

    return defaultNextTimeout
  }

  get event() {
    return this._event
  }
}
