import { Model } from '../../lib/model';
import { UserModel } from './user.model';

export class UserFollowModel extends Model {
  table = 'userFollow';
  columns = this.setColumns((t) => ({
    followingId: t.integer().foreignKey(() => UserModel, 'id'),
    followerId: t.integer().foreignKey(() => UserModel, 'id'),
    ...t.primaryKey(['followingId', 'followerId']),
  }));
}
