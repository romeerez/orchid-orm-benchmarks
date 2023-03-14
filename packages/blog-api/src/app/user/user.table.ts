import { BaseTable } from '../../lib/baseTable';
import { tableToZod } from 'orchid-orm-schema-to-zod';
import { UserFollowTable } from './userFollow.table';

export class UserTable extends BaseTable {
  readonly table = 'user';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    username: t.text().unique().max(30),
    email: t.text().unique().email(),
    password: t.text().min(8),
    ...t.timestamps(),
  }));

  relations = {
    follows: this.hasMany(() => UserFollowTable, {
      primaryKey: 'id',
      foreignKey: 'followingId',
    }),

    followings: this.hasMany(() => UserFollowTable, {
      primaryKey: 'id',
      foreignKey: 'followerId',
    }),
  };
}

export const userSchema = tableToZod(UserTable);
