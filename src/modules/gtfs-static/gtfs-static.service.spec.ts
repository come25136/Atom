import { Test, TestingModule } from '@nestjs/testing'
import { GtfsStaticService } from './gtfs-static.service'

describe('GtfsStaticService', () => {
  let service: GtfsStaticService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GtfsStaticService],
    }).compile()

    service = module.get<GtfsStaticService>(GtfsStaticService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
