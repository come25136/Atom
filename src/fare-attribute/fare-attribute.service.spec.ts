import { Test, TestingModule } from '@nestjs/testing';
import { FareAttributeService } from './fare-attribute.service';

describe('FareAttributeService', () => {
  let service: FareAttributeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FareAttributeService],
    }).compile();

    service = module.get<FareAttributeService>(FareAttributeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
