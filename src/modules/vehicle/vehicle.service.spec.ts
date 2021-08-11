import { Test, TestingModule } from '@nestjs/testing'
import { VehicleDrivingService } from './vehicle.service'

describe('VehicleService', () => {
  let service: VehicleDrivingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleDrivingService],
    }).compile()

    service = module.get<VehicleDrivingService>(VehicleDrivingService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
