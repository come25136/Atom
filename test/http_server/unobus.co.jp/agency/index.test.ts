import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../app'

describe('agency', () => {
  it('unobus.co.jp', async () =>
    req(app)
      .get('/v2/unobus.co.jp/agency')
      .expect(200)
      .then(({ body }) =>
        assert.deepEqual(body, [
          {
            id: '1260001000674',
            name: '宇野自動車株式会社',
            url: 'http://www.unobus.co.jp/',
            timezone: 'Asia/Tokyo',
            lang: 'ja',
            phone: '086-225-3311',
            fare_url: null,
            email: null
          }
        ])
      ))
})
