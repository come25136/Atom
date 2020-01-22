import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../../app'

export default function () {
  describe('Not found', () => {
    it('Out of service range.', async () =>
      req(app)
        .get('/v2/unobus.co.jp/trips/%E5%B9%B3%E6%97%A5_18%E6%99%8255%E5%88%86_%E7%B3%BB%E7%B5%B11041/route/2000-01-01')
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s no service ID.'
              }
            ]
          })
        ))
  })
}
