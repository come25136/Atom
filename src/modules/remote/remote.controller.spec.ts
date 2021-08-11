import { Test, TestingModule } from '@nestjs/testing'
import { RemoteController } from './remote.controller'

describe('RemotesController', () => {
  let controller: RemoteController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemoteController],
    }).compile()

    controller = module.get<RemoteController>(RemoteController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
