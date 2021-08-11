import { Test, TestingModule } from '@nestjs/testing'
import { RemoteService } from './remote.service'

describe('RemoteService', () => {
  let service: RemoteService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RemoteService],
    }).compile()

    service = module.get<RemoteService>(RemoteService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
