import { porm } from 'porm';
import { config } from './config';
import { UserModel } from './app/user/user.model';

export const db = porm(
  {
    connectionString: config.currentDatabaseUrl,
    log: true,
  },
  {
    user: UserModel,
  }
);
