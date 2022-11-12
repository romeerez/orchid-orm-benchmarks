import { routeHandler } from '../../lib/routeHandler';
import { getOptionalCurrentUserId } from '../user/user.service';
import { z } from 'zod';
import { UnauthorizedError } from '../../lib/errors';
import { articleDto } from './article.dto';
import { articleRepo } from './article.repo';

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

    let query = articleRepo
      .selectDto(currentUserId)
      .order({
        createdAt: 'DESC',
      })
      .limit(req.query.limit)
      .offset(req.query.offset);

    if (req.query.author) {
      query = query.filterByAuthorUsername(req.query.author);
    }

    if (req.query.tag) {
      query = query.filterByTag(req.query.tag);
    }

    if (req.query.feed || req.query.favorite) {
      if (!currentUserId) throw new UnauthorizedError();

      if (req.query.feed) {
        query = query.filterForUserFeed(currentUserId);
      }

      if (req.query.favorite) {
        query = query.filterFavorite(currentUserId);
      }
    }

    return query;
  }
);
