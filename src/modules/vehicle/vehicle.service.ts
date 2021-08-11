import * as dayjs from 'dayjs'
import * as geolib from 'geolib'
import { Geometry } from 'src/interfaces/geometry'
import { Remote } from 'src/database/tables/remote/remote.entity'
import { RemoteService } from '../remote/remote.service'
import { TripService } from '../trip/trip.service'
import { VehiclePosition } from 'src/protos/gtfs-realtime_pb'
import { closestPoint } from 'src/util'

// NOTE: Vehicleは車両管理用のクラスなので、時刻計算などはVehicleServiceでやる
export abstract class Vehicle {
  readonly isDriving: boolean

  constructor(
    readonly remoteUid: Remote['uid'],
    readonly startDate: dayjs.Dayjs,
    readonly route: {
      uid: number
      agency: {
        id: string
      }
      id: string
    },
    readonly trip: {
      uid: number
      id: string
    },
  ) {}
}

export class VehicleNotDriving extends Vehicle {
  readonly isDriving = false
}

export class VehicleDriving extends Vehicle {
  readonly isDriving = true

  private _descriptors: {
    id?: string
    label?: string
    licensePlate?: string
  } = {}
  private _delay:
    | {
        arrival: number
        departure: number | null
      }
    | {
        arrival: number | null
        departure: number
      }
    | {
        arrival: number
        departure: number
      }
    | null = null
  private _bearing = 0
  private _location: Geometry.Coordinate = { lat: 0, lon: 0 }
  private _currentStop: {
    // NOTE: 公式データが提供されている場合は使用する、されていない場合はlocationから算出する
    status: VehiclePosition.VehicleStopStatusMap[keyof VehiclePosition.VehicleStopStatusMap] // NOTE: デフォルトはIN_TRANSIT_TO
    sequence: number
  } = {
    status: VehiclePosition.VehicleStopStatus.INCOMING_AT,
    sequence: 0,
  }

  // NOTE: 車両不具合などで車両が変わる事を想定しdescriptorsはupdate内で処理する
  update(vehicle: {
    delay?:
      | {
          // NOTE: 公式データが提供されている場合は使用する、されていない場合はstartDate、currentStop, shapesを使用して算出する
          arrival: number
          departure: number | null
        }
      | {
          arrival: number | null
          departure: number
        }
      | {
          arrival: number
          departure: number
        }
    bearing?: number // NOTE: 0~359 公式データが提供されている場合は使用する、されていない場合はlocation, shapesを使用して算出する
    location: Geometry.Coordinate
    currentStop: {
      status?: keyof VehiclePosition.VehicleStopStatusMap
      sequence: number
    }
    descriptors?: { id?: string; label?: string; licensePlate?: string }
  }) {
    this._delay = vehicle.delay ?? null
    this._location = vehicle.location
    this._currentStop = {
      status:
        this.currentStop?.status ??
        VehiclePosition.VehicleStopStatus.INCOMING_AT,
      sequence: vehicle.currentStop.sequence,
    }
    if (vehicle.descriptors) this._descriptors = vehicle.descriptors
  }

  get descriptors() {
    return this._descriptors
  }

  get delay() {
    return this._delay
  }

  get bearing(): number {
    return this._bearing
  }

  get location(): Geometry.Coordinate {
    return this._location
  }

  get currentStop() {
    return this._currentStop
  }
}

export class VehicleService<VehicleType extends Vehicle = Vehicle> {
  constructor(
    protected remoteService: RemoteService,
    protected tripService: TripService,
    // protected stopTimeService: StopTimeService,
    protected vehicle: VehicleType,
    protected calcTripTime: AwaitReturnType<TripService['findRoutes']>[number],
  ) {}
}

export class VehicleNotDrivingService extends VehicleService<
  VehicleNotDriving
> {}

export class VehicleDrivingService extends VehicleService<VehicleDriving> {
  async update(...args: Parameters<VehicleDriving['update']>) {
    await this.vehicle.update(...args)
  }

  get id(): string {
    return this.vehicle.descriptors.id
  }

  get label(): string {
    return this.vehicle.descriptors.label
  }

  get licensePlate(): string {
    return this.vehicle.descriptors.licensePlate
  }

  get location(): Geometry.Coordinate {
    return this.vehicle.location
  }

  async progress(): Promise<number> {
    const { shapes } = await this.tripService.findOneByUid(
      this.vehicle.trip.uid,
      ['shapes', 'shapes.stop'],
    )
    shapes.sort((a, b) => a.sequence - b.sequence)
    const currentStop = this.calcTripTime.calcStops.find(
      stopTime => stopTime.sequence === this.vehicle.currentStop.sequence,
    )

    // const stopTime = await this.stopTimeService.findOneByUid(currentStopTime.uid)

    let shapeFlag = false
    let vehicleFlag = false
    let progressDistance = 0
    let totalDistance = 0

    for (let i = 0; i < shapes.length - 1; i++) {
      const { location: p1 } = shapes[i]
      const { location: p2 } = shapes[i + 1]
      const vehicleToShape = closestPoint(this.vehicle.location, p1, p2)

      if ((shapes[i].stop?.uid ?? null) === currentStop.uid) {
        shapeFlag = true
      }

      if (
        vehicleFlag ||
        (shapeFlag &&
          0 <= vehicleToShape.rangeRate &&
          vehicleToShape.rangeRate <= 1 &&
          geolib.getPreciseDistance(
            vehicleToShape.location,
            vehicleToShape.location,
          ) <= 30)
      ) {
        if (vehicleFlag === false) {
          progressDistance += geolib.getPreciseDistance(
            p1,
            vehicleToShape.location,
          )
          totalDistance += geolib.getPreciseDistance(
            vehicleToShape.location,
            p2,
          )

          vehicleFlag = true
        } else {
          totalDistance += geolib.getPreciseDistance(p1, p2)
        }
      } else {
        totalDistance = progressDistance += geolib.getPreciseDistance(p1, p2)
      }
    }

    if (vehicleFlag === false) {
      progressDistance = 0
      for (let i = 0; i < shapes.length - 1; i++) {
        const { location: p1 } = shapes[i]
        const { location: p2 } = shapes[i + 1]

        progressDistance += geolib.getPreciseDistance(p1, p2)

        if (geolib.isPointWithinRadius(this.vehicle.location, p2, 30)) {
          break
        }
      }
    }

    return progressDistance / totalDistance
  }

  get delay() {
    if (this.vehicle.delay !== null) return

    const currentStop = this.calcTripTime.calcStops.find(
      s => s.sequence === this.vehicle.currentStop.sequence,
    )

    currentStop.date.departure

    return this.vehicle.delay
  }

  get tripId() {
    return this.vehicle.trip.id
  }

  get headsign(): string {
    // FIXME: currentStop使うように修正
    return this.calcTripTime.trip.headsign
  }
}
