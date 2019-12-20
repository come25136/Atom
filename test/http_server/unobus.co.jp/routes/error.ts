import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../app'

export default function () {
  describe('Not found', () => {
    it('/0000', async () =>
      req(app)
        .get('/v2/unobus.co.jp/routes/0000')
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s no route.'
              }
            ]
          })
        ))

    it('/0000?detils=true', async () =>
      req(app)
        .get('/v2/unobus.co.jp/routes/0000/route/2019-10-21?details=true')
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s no route.'
              }
            ]
          })
        ))
  })
}
