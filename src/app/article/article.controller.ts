import { routeHandler } from '../../lib/routeHandler';
import {
  getCurrentUserId,
  getOptionalCurrentUserId,
} from '../user/user.service';
import { z } from 'zod';
import { UnauthorizedError } from '../../lib/errors';
import { articleDto } from './article.dto';
import { articleRepo } from './article.repo';
import { articleSchema } from './article.model';
import { db } from '../../db';
import { tagSchema } from './tag.model';

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

export const createArticleRoute = routeHandler(
  {
    body: articleSchema
      .pick({
        slug: true,
        title: true,
        body: true,
      })
      .extend({
        tags: tagSchema.shape.name.array(),
      }),
  },
  (req) => {
    const currentUserId = getCurrentUserId(req);

    return db.$transaction(async (db) => {
      const { tags, ...params } = req.body;

      const articleId = await db.article.get('id').create({
        ...params,
        favoritesCount: 0,
        userId: currentUserId,
        articleTags: {
          create: tags.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        },
      });

      return articleRepo(db.article).selectDto(currentUserId).find(articleId);
    });
  }
);
