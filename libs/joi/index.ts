import * as joi from '@hapi/joi'
import * as joiDate from '@hapi/joi-date'

interface CustomDateSchema extends joi.DateSchema {
  format(format: string): this
}

interface CustomJoiRoot extends joi.Root {
  date(): CustomDateSchema
}

const customJoi = joi.extend(joiDate) as CustomJoiRoot

export default customJoi
