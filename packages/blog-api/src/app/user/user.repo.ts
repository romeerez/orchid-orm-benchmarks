import { createRepo } from 'orchid-orm';
import { db } from '../../db';

export const userRepo = createRepo(db.user, {
  queryMethods: {
    selectDto(q, currentUserId: number | undefined) {
      return q.select('username', {
        following: currentUserId
          ? (q) => q.follows.where({ followerId: currentUserId }).exists()
          : q.raw((t) => t.boolean(), 'false'),
      });
    },
  },
});
