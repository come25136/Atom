import { WsErrorFilter } from './ws-error.filter'

describe('WsUnauthorizedFilter', () => {
  it('should be defined', () => {
    expect(new WsErrorFilter()).toBeDefined()
  })
})
