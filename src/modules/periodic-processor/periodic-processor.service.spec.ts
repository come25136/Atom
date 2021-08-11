import { Test, TestingModule } from '@nestjs/testing'
import { PeriodicProcessorService } from './periodic-processor.service'

describe('PeriodicProcessorService', () => {
  let service: PeriodicProcessorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeriodicProcessorService],
    }).compile()

    service = module.get<PeriodicProcessorService>(PeriodicProcessorService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
