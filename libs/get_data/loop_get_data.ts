import { writeFile } from 'fs'
import * as moment from 'moment'

import { BroadcastVehicle } from '../../interfaces'
import { Vehicle } from '../classes/create_vehicle'
import { createBusToBroadcastVehicle } from '../util'

export type dataUpdatedCallback = (loopName: string, broadcastVehicles: BroadcastVehicle[]) => void

export class LoopGetData {
  protected _loopTimer: NodeJS.Timer | null = null

  protected _changeTimes: number[] = []

  protected _prev: {
    date: moment.Moment | null
    data: {
      vehicles: Vehicle[]
      broadcastVehicles: BroadcastVehicle[]
    }
  } = {
    date: null,
    data: {
      vehicles: [],
      broadcastVehicles: []
    }
  }

  constructor(protected dataUpdatedCallback: dataUpdatedCallback) {
    this.loopStart()
  }

  protected async updateData(
    vehicles: Vehicle[],
    updatedDate: moment.Moment
  ): Promise<BroadcastVehicle[]> {
    this._prev.date = updatedDate

    this._prev.data.vehicles = vehicles
    this._prev.data.broadcastVehicles = await Promise.all(
      vehicles.map(async vehicle => createBusToBroadcastVehicle(vehicle))
    )

    process.env.NODE_ENV !== 'production' && process.stdout.write(`${this.name}: Bus update!!`)

    this.dataUpdatedCallback(this.name, this.broadcastVehicles)

    return this.broadcastVehicles
  }

  protected async save(
    data: string,
    extension: string,
    dataGeneratedDate: moment.Moment,
    save: boolean = false,
    subDirectoryPath: string = '/',
    path?: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (
        (process.env.REALTIME_DATA_SAVE !== undefined &&
          process.env.REALTIME_DATA_SAVE !== 'true') ||
        save === false
      )
        return resolve()

      writeFile(
        `./${process.env.REALTIME_DATA_SAVE_PATH || path || 'realtime_data'}/${
          this.name
        }${subDirectoryPath}${dataGeneratedDate.format('YYYY-MM-DD HH-mm-ss')}.${extension}`,
        data,
        err => (err ? reject(err) : resolve())
      )
    })
  }

  public get name(): string {
    return 'base'
  }

  public get buses(): Vehicle[] {
    return this._prev.data.vehicles
  }

  public get broadcastVehicles(): BroadcastVehicle[] {
    return this._prev.data.broadcastVehicles
  }

  protected loop() {}

  public loopStart(): void {
    this.loop()
  }

  public get loopStatus(): boolean {
    return this._loopTimer !== null
  }

  public loopStop(): void {
    if (this._loopTimer) {
      clearTimeout(this._loopTimer)
      this._loopTimer = null
    }
  }
}
