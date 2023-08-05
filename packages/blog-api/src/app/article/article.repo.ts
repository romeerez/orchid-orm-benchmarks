import { createRepo } from 'orchid-orm';
import { db } from '../../db';
import { userRepo } from '../user/user.repo';
import { tagRepo } from '../tag/tag.repo';
import { SelectQueryBuilder } from 'pqb';

const selectFavorited = (currentUserId: number | undefined) => {
  return (q: SelectQueryBuilder<typeof db.article>) =>
    currentUserId
      ? q.favorites.where({ userId: currentUserId }).exists()
      : q.sql`false`.type((t) => t.boolean());
};

export const articleRepo = createRepo(db.article, {
  queryMethods: {
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
          favorited: selectFavorited(currentUserId),
          author: (q) => userRepo(q.author).selectDto(currentUserId),
        }
      );
    },
    selectFavorited(q, currentUserId: number | undefined) {
      return q.select({ favorited: selectFavorited(currentUserId) });
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
  },
  queryOneWithWhereMethods: {
    async updateTags(
      q,
      currentTags: { id: number; name: string }[],
      tags?: string[]
    ) {
      const currentTagNames = currentTags.map(({ name }) => name);
      const addTagNames = tags?.filter(
        (name) => !currentTagNames.includes(name)
      );
      const removeTagIds = tags
        ? currentTags
            .filter(({ name }) => !tags.includes(name))
            .map((tag) => tag.id)
        : [];

      await q.update({
        articleTags: {
          create: addTagNames?.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
          delete: removeTagIds.length ? { tagId: { in: removeTagIds } } : [],
        },
      });

      if (removeTagIds.length) {
        await tagRepo.whereIn('id', removeTagIds).deleteUnused();
      }
    },
  },
});
