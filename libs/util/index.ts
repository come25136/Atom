import * as env from 'env-var'
import * as _ from 'lodash'
import * as moment from 'moment-timezone'

import { EmitPositions } from '../../interfaces'
import { Vehicle } from '../classes/create_vehicle'

/**
 * @param date 00:00:00
 * @param standard
 */
export function h24ToLessH24(
  date: string | moment.Moment,
  standard: moment.Moment = moment(),
  override: boolean = true,
  subtract: boolean = false,
  keepLocalTime: boolean = false
): moment.Moment {
  let time: {
    hour: number
    minute: number
    second: number
  }

  if (typeof date === 'string') {
    const timeSplit = date.split(':')
    time = {
      hour: Number(timeSplit[0]),
      minute: Number(timeSplit[1] || 0),
      second: Number(timeSplit[2] || 0)
    }
  } else if (date instanceof Date)
    time = {
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds()
    }
  else
    time = {
      hour: date.hour(),
      minute: date.minute(),
      second: date.second()
    }

  const utcOffset = moment.isMoment(date) ? date.utcOffset() : standard.utcOffset()

  const standardTz = standard.clone().utcOffset(utcOffset, keepLocalTime)

  if (override)
    if (subtract)
      standardTz
        .subtract(Math.floor(time.hour / 24), 'd')
        .hour(1 <= time.hour / 24 ? (time.hour / 24 - Math.floor(time.hour / 24)) * 24 : time.hour)
        .minute(time.minute)
        .second(time.second)
    else
      standardTz
        .hour(time.hour)
        .minute(time.minute)
        .second(time.second)
  else
    standardTz
      .add(time.hour, 'h')
      .add(time.minute, 'm')
      .add(time.second, 's')

  standardTz.tz(standard.tz())

  return standardTz
}
/**
 *
 * @param time 03:00:00
 */
export function millisecondsUntilNextTime(_time: string): number {
  const now: moment.Moment = moment()
  const time: moment.Moment = moment(_time, 'HH:mm:ss')

  return now
    .clone()
    .add(now.isSameOrAfter(time) ? 1 : 0, 'd')
    .set({
      h: time.hour(),
      m: time.minute(),
      s: time.seconds()
    })
    .diff(now, 'ms')
}
export function objSnakeCase<Obj extends object>(obj: Obj) {
  return _.mapKeys(obj, (v, k) => _.snakeCase(k))
}

export function toEmitData(remoteId: string, vehicles: Vehicle['public'][]): EmitPositions {
  return {
    remote: {
      id: remoteId
    },
    vehicles
  }
}

export function debug(f: Function) {
  if (env.get('NODE_ENV', 'development').asString() === 'development') return f()
}
