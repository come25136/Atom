import { Test, TestingModule } from '@nestjs/testing'
import { PeriodicProcessorServiceFactory } from './periodic-processor-service-factory'

describe('PeriodicProcessorServiceFactory', () => {
  let provider: PeriodicProcessorServiceFactory

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeriodicProcessorServiceFactory],
    }).compile()

    provider = module.get<PeriodicProcessorServiceFactory>(
      PeriodicProcessorServiceFactory,
    )
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })
})
