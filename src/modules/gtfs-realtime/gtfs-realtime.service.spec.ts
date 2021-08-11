import { Test, TestingModule } from '@nestjs/testing'
import { GtfsRealtimeService } from './gtfs-realtime.service'

describe('GtfsRealtimeService', () => {
  let service: GtfsRealtimeService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GtfsRealtimeService],
    }).compile()

    service = module.get<GtfsRealtimeService>(GtfsRealtimeService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
