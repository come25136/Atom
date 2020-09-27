import { Test, TestingModule } from '@nestjs/testing';
import { FareRuleService } from './fare-rule.service';

describe('FareRuleService', () => {
  let service: FareRuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FareRuleService],
    }).compile();

    service = module.get<FareRuleService>(FareRuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
