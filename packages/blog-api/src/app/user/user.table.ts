import { BaseTable } from '../../lib/baseTable';
import { UserFollowTable } from './userFollow.table';

export class UserTable extends BaseTable {
  readonly table = 'user';
  columns = this.setColumns((t) => ({
    id: t.identity().primaryKey(),
    username: t.text().unique().max(30),
    email: t.text().unique().email(),
    password: t.text().min(8),
    ...t.timestamps(),
  }));

  relations = {
    follows: this.hasMany(() => UserFollowTable, {
      columns: ['id'],
      references: ['followingId'],
    }),

    followings: this.hasMany(() => UserFollowTable, {
      columns: ['id'],
      references: ['followerId'],
    }),
  };
}
