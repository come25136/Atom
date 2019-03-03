import * as moment from 'moment'
import { Server as socketIoServer } from 'socket.io'

import { BroadcastVehicle, EmitPositions } from '../../interfaces'

export * from './translate'

export function getDataDir(): string {
  const dataDir = process.env.DATA || './data'

  return dataDir.slice(-1) === '/' ? dataDir.slice(0, -1) : dataDir
}

/**
 * @param date 00:00:00
 * @param standard
 */
export function h24ToLessH24(
  _time: string,
  standard: moment.Moment = moment(),
  override: boolean = true,
  subtract: boolean = false
): moment.Moment {
  const timeSplit = _time.split(':')
  const time = {
    hour: Number(timeSplit[0]),
    minute: Number(timeSplit[1] || 0),
    second: Number(timeSplit[2] || 0)
  }

  return override
    ? subtract
      ? standard
          .clone()
          .subtract(Math.floor(time.hour / 24), 'd')
          .hour(
            1 <= time.hour / 24 ? (time.hour / 24 - Math.floor(time.hour / 24)) * 24 : time.hour
          )
          .minute(time.minute)
          .second(time.second)
      : standard
          .clone()
          .hour(time.hour)
          .minute(time.minute)
          .second(time.second)
    : standard
        .clone()
        .add(time.hour, 'h')
        .add(time.minute, 'm')
        .add(time.second, 's')
}

export function ioEmitBus(io: socketIoServer, companyName: string, buses: BroadcastVehicle[]) {
  io.to(companyName).emit('bus', {
    company_name: companyName,
    buses
  } as EmitPositions)
}

export function convertStringFullWidthToHalfWidth<char extends string | null>(
  char: char
): string | char {
  return typeof char === 'string'
    ? char
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
        .replace(/（(.*)）/, '($1)')
        .replace(/(\S)(?!\s)(\()/, '$1 $2')
        .replace(/(\))(?!\s)(\S)/, '$1 $2')
    : char
}
