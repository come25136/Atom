import { Test, TestingModule } from '@nestjs/testing'
import { StopClusterService } from './stop-cluster.service'

describe('StopClusterService', () => {
  let service: StopClusterService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StopClusterService],
    }).compile()

    service = module.get<StopClusterService>(StopClusterService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
