import { BaseTable } from '../../lib/baseTable';
import { UserTable } from './user.table';

export class UserFollowTable extends BaseTable {
  table = 'userFollow';
  columns = this.setColumns((t) => ({
    followingId: t.integer().foreignKey(() => UserTable, 'id'),
    followerId: t.integer().foreignKey(() => UserTable, 'id'),
    ...t.primaryKey(['followingId', 'followerId']),
  }));
}
