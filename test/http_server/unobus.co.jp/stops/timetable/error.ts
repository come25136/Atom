import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../../app'

export default function () {
  describe('Not found', () => {
    it('/null/timetable', async () =>
      req(app)
        .get('/v2/unobus.co.jp/stops/null/timetable/2019-10-21')
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

    it('Out of service range.', async () =>
      req(app)
        .get('/v2/unobus.co.jp/stops/2_01/timetable/2000-01-01')
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
