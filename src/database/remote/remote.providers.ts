import { Connection } from 'typeorm';
import { Remote } from './remote.entity';
import { REMOTE_REPOSITORY } from '../constants';

export const remoteProviders = [
  {
    provide: REMOTE_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(Remote),
    inject: ['DATABASE_CONNECTION'],
  },
];
