import { createRepo } from 'porm';
import { db } from '../../db';
import { userRepo } from '../user/user.repo';

export const articleRepo = createRepo(db.article, {
  selectDto(q, currentUserId: number | undefined) {
    return q.select(
      'slug',
      'title',
      'body',
      'favoritesCount',
      'createdAt',
      'updatedAt',
      {
        tags: (q) => q.tags.order('name').pluck('name'),
        favorited: currentUserId
          ? (q) => q.favorites.where({ userId: currentUserId }).exists()
          : db.article.raw((t) => t.boolean(), 'false'),
        author: (q) => userRepo(q.author).selectDto(currentUserId),
      }
    );
  },
  filterByAuthorUsername(q, username: string) {
    return q.whereExists('author', (q) => q.where({ username }));
  },
  filterByTag(q, name: string) {
    return q.whereExists('tags', (q) => q.where({ name }));
  },
  filterForUserFeed(q, currentUserId: number) {
    return q.whereExists('author', (q) =>
      q.whereExists('follows', (q) => q.where({ followerId: currentUserId }))
    );
  },
  filterFavorite(q, currentUserId: number) {
    return q.whereExists('favorites', (q) =>
      q.where({ userId: currentUserId })
    );
  },
});
