import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../app'

export default function () {
  describe('Not found', () => {
    it('/null', async () =>
      req(app)
        .get('/v2/unobus.co.jp/stops/null')
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s no stop.'
              }
            ]
          })
        ))
  })
}
