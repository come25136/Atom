import { Test, TestingModule } from '@nestjs/testing'
import { VehicleServiceFactory } from './vehicle-service-factory'

describe('VehicleServiceFactory', () => {
  let provider: VehicleServiceFactory

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleServiceFactory],
    }).compile()

    provider = module.get<VehicleServiceFactory>(VehicleServiceFactory)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })
})
