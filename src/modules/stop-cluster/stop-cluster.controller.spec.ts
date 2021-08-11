import { Test, TestingModule } from '@nestjs/testing'
import { StopClusterController } from './stop-cluster.controller'

describe('StopClusterController', () => {
  let controller: StopClusterController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StopClusterController],
    }).compile()

    controller = module.get<StopClusterController>(StopClusterController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
