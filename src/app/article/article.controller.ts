import { routeHandler } from '../../lib/routeHandler';
import { db } from '../../db';
import { getOptionalCurrentUserId } from '../user/user.service';
import { z } from 'zod';
import { UnauthorizedError } from '../../lib/errors';
import { articleDto } from './article.dto';

export const listArticlesRoute = routeHandler(
  {
    query: z.object({
      author: z.string().optional(),
      tag: z.string().optional(),
      feed: z.literal('true').optional(),
      favorite: z.literal('true').optional(),
      limit: z
        .preprocess((s) => parseInt(s as string), z.number().min(1).max(20))
        .default(20),
      offset: z
        .preprocess((s) => parseInt(s as string), z.number().min(0))
        .optional(),
    }),
    result: articleDto.array(),
  },
  (req) => {
    const currentUserId = getOptionalCurrentUserId(req);

    let query = db.article
      .select(
        'slug',
        'title',
        'body',
        'favoritesCount',
        'createdAt',
        'updatedAt',
        {
          tags: (q) => q.tags.pluck('name'),
          favorited: currentUserId
            ? (q) => q.favorites.where({ userId: currentUserId }).exists()
            : db.article.raw((t) => t.boolean(), 'false'),
          author: (q) =>
            q.author.select('username', {
              following: currentUserId
                ? (q) => q.follows.where({ followerId: currentUserId }).exists()
                : db.article.raw((t) => t.boolean(), 'false'),
            }),
        }
      )
      .order({
        createdAt: 'DESC',
      })
      .limit(req.query.limit)
      .offset(req.query.offset);

    if (req.query.author) {
      query = query.whereExists('author', (q) =>
        q.where({ username: req.query.author })
      );
    }

    if (req.query.tag) {
      query = query.whereExists('tags', (q) =>
        q.where({ name: req.query.tag })
      );
    }

    if (req.query.feed || req.query.favorite) {
      if (!currentUserId) throw new UnauthorizedError();

      if (req.query.feed) {
        query = query.whereExists('author', (q) =>
          q.whereExists('follows', (q) =>
            q.where({ followerId: currentUserId })
          )
        );
      }

      if (req.query.favorite) {
        query = query.whereExists('favorites', (q) =>
          q.where({ userId: currentUserId })
        );
      }
    }

    return query;
  }
);
