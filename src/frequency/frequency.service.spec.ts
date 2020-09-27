import { Test, TestingModule } from '@nestjs/testing';
import { FrequencyService } from './frequency.service';

describe('FrequencyService', () => {
  let service: FrequencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrequencyService],
    }).compile();

    service = module.get<FrequencyService>(FrequencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
