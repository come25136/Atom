import * as ioClient from 'socket.io-client'

interface Inames {
  ja: string
  'ja-Hrkt': string
  en: string
}

interface Ibus {
  route_num: number
  okayama_stop_time: string
  delay: number
  run: boolean
  license_number: number
  location: {
    lat: number
    lon: number
  }
  stops: {
    first: {
      name: Inames
      time: string
    }
    passing: {
      name: Inames
      time: string
      pass_time: string
    }
    next: {
      name: Inames
      time: string
    }
  }
}

const socket = ioClient('http://localhost:3001')

socket.on('connect', () => console.log('connect'))

socket.on('unobus', (buses: Ibus[]) =>
  buses.forEach(bus => {
    try {
      if (bus.stops.passing.name.ja === '') console.log(bus)
    } catch (err) {
      console.log(bus)
    }
  })
)
