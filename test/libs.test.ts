import { assert } from 'chai'

import * as moment from 'moment'

import route from '../libs/route'

describe('route', () => {
  it('not trip', () =>
    route('unobus', 0, moment('2000-01-01')).catch(({ message }) =>
      assert.strictEqual(message, 'There is no such route.')
    ))
})
