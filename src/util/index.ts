import * as dayjs from 'dayjs'
import * as dayjsUtc from 'dayjs/plugin/utc'
import { Geometry } from 'src/interfaces/geometry'

export * from './mode'

dayjs.extend(dayjsUtc)

export interface Location {
  lat: number
  lon: number
}

export interface Bounds {
  north: number
  west: number
  south: number
  east: number
}

// NOTE: MariaDB側のenumがone indexなので...
export enum ISO4217 {
  'AED' = 1,
  'AFN' = 2,
  'ALL' = 3,
  'AMD' = 4,
  'ANG' = 5,
  'AOA' = 6,
  'ARS' = 7,
  'AUD' = 8,
  'AWG' = 9,
  'AZN' = 10,
  'BAM' = 11,
  'BBD' = 12,
  'BDT' = 13,
  'BGN' = 14,
  'BHD' = 15,
  'BIF' = 16,
  'BMD' = 17,
  'BND' = 18,
  'BOB' = 19,
  'BRL' = 20,
  'BSD' = 21,
  'BTN' = 22,
  'BWP' = 23,
  'BYN' = 24,
  'BZD' = 25,
  'CAD' = 26,
  'CDF' = 27,
  'CHF' = 28,
  'CLP' = 29,
  'CNY' = 30,
  'COP' = 31,
  'CRC' = 32,
  'CUC' = 33,
  'CUP' = 34,
  'CVE' = 35,
  'CZK' = 36,
  'DJF' = 37,
  'DKK' = 38,
  'DOP' = 39,
  'DZD' = 40,
  'EGP' = 41,
  'ERN' = 42,
  'ETB' = 43,
  'EUR' = 44,
  'FJD' = 45,
  'FKP' = 46,
  'GBP' = 47,
  'GEL' = 48,
  'GGP' = 49,
  'GHS' = 50,
  'GIP' = 51,
  'GMD' = 52,
  'GNF' = 53,
  'GTQ' = 54,
  'GYD' = 55,
  'HKD' = 56,
  'HNL' = 57,
  'HRK' = 58,
  'HTG' = 59,
  'HUF' = 60,
  'IDR' = 61,
  'ILS' = 62,
  'INR' = 63,
  'IQD' = 64,
  'IRR' = 65,
  'ISK' = 66,
  'JMD' = 67,
  'JOD' = 68,
  'JPY' = 69,
  'KES' = 70,
  'KGS' = 71,
  'KHR' = 72,
  'KMF' = 73,
  'KPW' = 74,
  'KRW' = 75,
  'KWD' = 76,
  'KYD' = 77,
  'KZT' = 78,
  'LAK' = 79,
  'LBP' = 80,
  'LKR' = 81,
  'LRD' = 82,
  'LSL' = 83,
  'LYD' = 84,
  'MAD' = 85,
  'MDL' = 86,
  'MGA' = 87,
  'MKD' = 88,
  'MMK' = 89,
  'MNT' = 90,
  'MOP' = 91,
  'MRO' = 92,
  'MUR' = 93,
  'MVR' = 94,
  'MWK' = 95,
  'MXN' = 96,
  'MYR' = 97,
  'MZN' = 98,
  'NAD' = 99,
  'NGN' = 100,
  'NIO' = 101,
  'NOK' = 102,
  'NPR' = 103,
  'NZD' = 104,
  'OMR' = 105,
  'PAB' = 106,
  'PEN' = 107,
  'PGK' = 108,
  'PHP' = 109,
  'PKR' = 110,
  'PLN' = 111,
  'PYG' = 112,
  'QAR' = 113,
  'RON' = 114,
  'RSD' = 115,
  'RUB' = 116,
  'RWF' = 117,
  'SAR' = 118,
  'SBD' = 119,
  'SCR' = 120,
  'SDG' = 121,
  'SEK' = 122,
  'SGD' = 123,
  'SHP' = 124,
  'SLL' = 125,
  'SOS' = 126,
  'SRD' = 127,
  'SSP' = 128,
  'STN' = 129,
  'SVC' = 130,
  'SYP' = 131,
  'SZL' = 132,
  'THB' = 133,
  'TJS' = 134,
  'TMT' = 135,
  'TND' = 136,
  'TOP' = 137,
  'TRY' = 138,
  'TTD' = 139,
  'TWD' = 140,
  'TZS' = 141,
  'UAH' = 142,
  'UGX' = 143,
  'USD' = 144,
  'UYU' = 145,
  'UZS' = 146,
  'VEF' = 147,
  'VND' = 148,
  'VUV' = 149,
  'WST' = 150,
  'XAF' = 151,
  'XAG' = 152,
  'XAU' = 153,
  'XCD' = 154,
  'XDR' = 155,
  'XOF' = 156,
  'XPD' = 157,
  'XPF' = 158,
  'XPT' = 159,
  'XTS' = 160,
  'XXX' = 161,
  'YER' = 162,
  'ZAR' = 163,
  'ZMW' = 164,
  'ZWL' = 165,
}

// NOTE: 全角から半角に変換
export function convertStringFullWidthToHalfWidth<Char extends string | null>(
  char: Char,
): string | Char {
  return typeof char === 'string'
    ? char
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, char =>
        String.fromCharCode(char.charCodeAt(0) - 0xfee0),
      )
      .replace(/（(.*)）/, '($1)')
      .replace(/(\S)(?!\s)(\()/, '$1 $2')
      .replace(/(\))(?!\s)(\S)/, '$1 $2')
    : char
}

export const dayjsToDB = {
  from: (v: dayjs.Dayjs | null) => (v === null ? null : dayjs(v).utc(true)),
  to: (v: dayjs.Dayjs | Date) =>
    dayjs.isDayjs(v) ? new Date(v.utc().format('YYYY-MM-DD HH:mm:ss')) : v,
}

/**
 * @param date 00:00:00
 * @param standard
 */
export function h24ToLessH24(
  date: string | dayjs.Dayjs,
  standard: dayjs.Dayjs = dayjs(),
  override = true,
  subtract = false,
  keepLocalTime = false,
): dayjs.Dayjs {
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
      second: Number(timeSplit[2] || 0),
    }
  } else if (date instanceof Date)
    time = {
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    }
  else
    time = {
      hour: date.hour(),
      minute: date.minute(),
      second: date.second(),
    }

  const utcOffset = dayjs.isDayjs(date)
    ? date.utcOffset()
    : standard.utcOffset()

  const standardTz = standard.clone().utcOffset(utcOffset, keepLocalTime)

  if (override)
    if (subtract)
      standardTz
        .subtract(Math.floor(time.hour / 24), 'd')
        .hour(
          1 <= time.hour / 24
            ? (time.hour / 24 - Math.floor(time.hour / 24)) * 24
            : time.hour,
        )
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

  standardTz.utcOffset(standard.utcOffset())

  return standardTz
}

// https://jsfiddle.net/soulwire/UA6H5/
export function closestPoint(
  location: Geometry.Coordinate,
  p1: Geometry.Coordinate,
  p2: Geometry.Coordinate,
): {
  location: Geometry.Coordinate & {
    isLeft: boolean
    lineToDistance: number // p1とp2を結んだ線上までのlocationからの距離(単位不明)
  }
  rangeRate: number // p1とp2を結んだ線上でのp1からlocationの正規化された距離 ~ 0 ~ 1 ~
} {
  const atob = { x: p2.lon - p1.lon, y: p2.lat - p1.lat }
  const atop = { x: location.lon - p1.lon, y: location.lat - p1.lat }
  const len = atob.x * atob.x + atob.y * atob.y
  let dot = atop.x * atob.x + atop.y * atob.y
  const t = dot / len
  dot =
    (p2.lon - p1.lon) * (location.lat - p1.lat) -
    (p2.lat - location.lat) * (p1.lon - p1.lon)

  return {
    location: {
      lat: p1.lat + atob.y * t,
      lon: p1.lon + atob.x * t,
      isLeft: dot < 1,
      lineToDistance: dot,
    },
    rangeRate: t,
  }
}
