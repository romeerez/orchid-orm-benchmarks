import { createRepo } from 'orchid-orm';
import { db } from '../../db';

export const userRepo = createRepo(db.user, {
  queryMethods: {
    selectDTO(q, currentUserId: number | undefined) {
      return q.select('username', {
        following: currentUserId
          ? (q) => q.follows.where({ followerId: currentUserId }).exists()
          : q.sql`false`.type((t) => t.boolean()),
      });
    },
  },
});
