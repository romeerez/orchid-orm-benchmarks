import { createRepo } from 'porm';
import { db } from '../../db';

export const userRepo = createRepo(db.user, {
  selectDto(q, currentUserId: number | undefined) {
    return q.select('username', {
      following: currentUserId
        ? (q) => q.follows.where({ followerId: currentUserId }).exists()
        : db.article.raw((t) => t.boolean(), 'false'),
    });
  },
});
