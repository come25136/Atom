import * as env from 'env-var'
import winston = require('winston')

const NODE_ENV = env.get('NODE_ENV', 'development').asString()

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss+09:00' }), winston.format.json()),
  transports: [
    new winston.transports.Console({
      level: NODE_ENV === 'development' ? 'debug' : 'info'
    })
  ]
})

export default logger
