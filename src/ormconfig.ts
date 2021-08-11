import * as env from 'env-var'
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

import { Mode, runMode } from "./util";

const config: TypeOrmModuleOptions = {
  type: 'mariadb',
  host: env.get('DATABASE_HOST').default(runMode(Mode.DATA_UPDATER, false) ? 'database-source' : 'dataabse-replica').asString(),
  port: env.get('DATABASE_PORT').default(3306).asPortNumber(),
  username: env.get('DATABASE_USER').default('root').asString(),
  password: env.get('DATABASE_PASSWORD').default('').asString(),
  database: env.get('DATABASE_NAME').default('atom').asString(),
  charset: 'utf8', // NOTE: Specified key was too long; max key length is 3072 bytes. に引っかかるので仕方なく...
  synchronize: env.get('DATABASE_SYNCHRONIZE').default('false').asBoolStrict() === true && runMode(Mode.DATA_UPDATER, false),
  logging: env.get('SQL_LOGGING').default('false').asBoolStrict() || ['error'],
  migrations: [
    'dist/database/migrations/**/*.ts',
  ],
  cli: {
    entitiesDir: 'src/database/tables',
    migrationsDir: 'src/database/migrations',
  },
}

export default config
