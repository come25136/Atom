import { Test, TestingModule } from '@nestjs/testing'
import { StopsController } from './stops.controller'

describe('StopsController', () => {
  let controller: StopsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StopsController],
    }).compile()

    controller = module.get<StopsController>(StopsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
