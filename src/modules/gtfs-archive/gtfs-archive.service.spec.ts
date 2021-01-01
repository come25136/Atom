import { Test, TestingModule } from '@nestjs/testing'
import { GtfsArchiveService } from './gtfs-archive.service'

describe('GtfsZipService', () => {
  let service: GtfsArchiveService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GtfsArchiveService],
    }).compile()

    service = module.get<GtfsArchiveService>(GtfsArchiveService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
