import { porm } from 'porm';
import { config } from './config';
import { UserModel } from './app/user/user.model';
import { UserFollowModel } from './app/user/userFollow.model';

export const db = porm(
  {
    connectionString: config.currentDatabaseUrl,
    log: true,
  },
  {
    user: UserModel,
    userFollow: UserFollowModel,
  }
);
