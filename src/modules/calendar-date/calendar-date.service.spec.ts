import { Test, TestingModule } from '@nestjs/testing'
import { CalendarDateService } from './calendar-date.service'

describe('CalendarDateService', () => {
  let service: CalendarDateService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarDateService],
    }).compile()

    service = module.get<CalendarDateService>(CalendarDateService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
