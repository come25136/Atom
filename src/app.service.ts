import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import {
  TranslationRepository,
  TranslationType,
} from 'src/database/tables/translation/translation.repository'
import { Remote } from 'src/database/tables/remote/remote.entity'
import { Translation } from 'src/database/tables/translation/translation.entity'

@Injectable()
export class AppService implements OnApplicationBootstrap  {
  constructor() {}

  onApplicationBootstrap() {
    Logger.log(`
  ___  _                  
 / _ \\| |                 
/ /_\\ \\ |_ ___  _ __ ___  
|  _  | __/ _ \\| \'_ \` _  \\ 
| | | | || (_) | | | | | |
\\_| |_/\\__\\___/|_| |_| |_|
                             
    `)
  }
}
