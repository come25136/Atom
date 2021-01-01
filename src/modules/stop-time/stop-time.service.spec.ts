import { Test, TestingModule } from '@nestjs/testing'
import { StopTimeService } from './stop-time.service'

describe('StopTimeService', () => {
  let service: StopTimeService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StopTimeService],
    }).compile()

    service = module.get<StopTimeService>(StopTimeService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
