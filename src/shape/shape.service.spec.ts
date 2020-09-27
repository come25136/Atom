import { Test, TestingModule } from '@nestjs/testing';
import { ShapeService } from './shape.service';

describe('ShapeService', () => {
  let service: ShapeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShapeService],
    }).compile();

    service = module.get<ShapeService>(ShapeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
