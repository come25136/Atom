import { assert } from 'chai'
import * as moment from 'moment'

import { getRoutesStops } from '../libs/route'

describe('route', () => {
  it('not trip', async () =>
    getRoutesStops('unobus', '0', moment('2000-01-01')).catch(({ message }) =>
      assert.strictEqual(message, 'There is no such route.')
    ))
})
