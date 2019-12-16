import { Vehicle } from './libs/classes/create_vehicle'

export interface EmitPositions {
  remote: {
    id: string
  }
  vehicles: Vehicle['public'][]
}
