/* eslint-disable @typescript-eslint/no-var-requires */
const env = require('env-var')

module.exports = {
  type: 'mysql',
  host: env.get('DB_HOST', 'mariadb').asString(),
  port: env.get('DB_PORT', '3306').asInt(),
  username: env.get('DB_USERNAME', 'root').asString(),
  password: env.get('DB_PASSWORD', 'root').asString(),
  database: env.get('DB_DATABASE', 'atom').asString(),
  synchronize: env.get('DB_SYNC', 'false').asBoolStrict(),
  logging: env.get('DB_LOGGING', 'false').asBoolStrict(),
  entities: ['dist/db/entitys/**/*.js'],
  migrations: ['dist/db/migrations/**/*.js'],
  subscribers: ['dist/db/subscribers/**/*.js'],
  cli: {
    entitiesDir: 'db/entities',
    migrationsDir: 'db/migrations',
    subscribersDir: 'db/subscribers'
  }
}
