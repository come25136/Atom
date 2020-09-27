import { Test, TestingModule } from '@nestjs/testing';
import { StopService } from './stop.service';

describe('StopService', () => {
  let service: StopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StopService],
    }).compile();

    service = module.get<StopService>(StopService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
