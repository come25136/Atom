import { Test, TestingModule } from '@nestjs/testing'
import { AttributionService } from './attribution.service'

describe('AttributionService', () => {
  let service: AttributionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttributionService],
    }).compile()

    service = module.get<AttributionService>(AttributionService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
