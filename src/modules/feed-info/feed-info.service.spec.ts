import { Test, TestingModule } from '@nestjs/testing'
import { FeedInfoService } from './feed-info.service'

describe('FeedInfoService', () => {
  let service: FeedInfoService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedInfoService],
    }).compile()

    service = module.get<FeedInfoService>(FeedInfoService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
