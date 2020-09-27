import { Test, TestingModule } from '@nestjs/testing';
import { PathwayService } from './pathway.service';

describe('PathwayService', () => {
  let service: PathwayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PathwayService],
    }).compile();

    service = module.get<PathwayService>(PathwayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
