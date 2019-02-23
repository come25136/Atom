import { writeFile } from 'fs'
import * as moment from 'moment'

import { BroadcastVehicle } from '../../interfaces'
import { Vehicle } from '../classes/create_vehicle'
import { createBusToBroadcastVehicle } from '../util'

export type dataUpdatedCallback = (loopName: string, broadcastVehicles: BroadcastVehicle[]) => void

interface Prev {
  date: moment.Moment | null
  data: {
    vehicles: Vehicle[]
    broadcastVehicles: BroadcastVehicle[]
  }
}

export class LoopGetData {
  private _loopTimer: NodeJS.Timer | null = null

  private _changeTimes: number[] = []

  private _prev: Prev = {
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

    process.env.NODE_ENV !== 'production' && console.log(`${this.name}: Bus update!!`)
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

  protected get prev(): Prev {
    return this._prev
  }

  protected get buses(): Vehicle[] {
    return this._prev.data.vehicles
  }

  public get broadcastVehicles(): BroadcastVehicle[] {
    return this._prev.data.broadcastVehicles
  }

  protected get changeTimes(): number[] {
    return this._changeTimes
  }

  protected addChangeTime(ms: number) {
    this._changeTimes.push(ms)
    if (10 < this._changeTimes.length) this._changeTimes.shift()
  }

  protected get averageChangeTime(): number | null {
    return this._prev.date && 0 < this._changeTimes.length
      ? this._prev.date
          .clone()
          .add(
            this._changeTimes.reduce((prev, current) => prev + current) / this._changeTimes.length,
            'ms'
          )
          .diff(moment())
      : 0
  }

  protected loop() {}

  public nextLoop(time: number): void {
    this._loopTimer = setTimeout(() => this.loop(), time)
  }

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

  public dispose() {
    this.loopStop()
  }
}
