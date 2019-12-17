import { Remote } from '../db/entitys/gtfs/remote'

declare module 'express-serve-static-core' {
  interface Response {
    middlelocals: {
      remote: Remote
      timezone: string
    }
  }
}
