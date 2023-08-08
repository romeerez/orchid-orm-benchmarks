import { routeHandler } from '../../lib/routeHandler';
import {
  getCurrentUserId,
  getOptionalCurrentUserId,
} from '../user/user.service';
import { z } from 'zod';
import { UnauthorizedError } from '../../lib/errors';
import {
  articleCreateDTO,
  articleDTO,
  articleSlugDTO,
  articleUpdateDTO,
} from './article.dto';
import { articleRepo } from './article.repo';
import { db } from '../../db';
import { tagRepo } from '../tag/tag.repo';

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
    result: articleDTO.array(),
  },
  (req) => {
    const currentUserId = getOptionalCurrentUserId(req);

    let query = articleRepo
      .selectDTO(currentUserId)
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
    body: articleCreateDTO,
    result: articleDTO,
  },
  (req) => {
    const currentUserId = getCurrentUserId(req);

    return db.$transaction(async () => {
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

      return articleRepo.selectDTO(currentUserId).find(articleId);
    });
  }
);

export const updateArticleRoute = routeHandler(
  {
    body: articleUpdateDTO,
    params: articleSlugDTO,
    result: articleDTO,
  },
  (req) => {
    const currentUserId = getCurrentUserId(req);

    return db.$transaction(async () => {
      const { slug } = req.params;

      const article = await articleRepo
        .findBy({ slug })
        .select('id', 'userId', {
          tags: (q) => q.tags.select('id', 'name'),
        });

      if (article.userId !== currentUserId) {
        throw new UnauthorizedError();
      }

      const { tags, favorite, ...params } = req.body;

      await articleRepo
        .find(article.id)
        .update(params)
        .updateTags(article.tags, tags);

      return await articleRepo.selectDTO(currentUserId).find(article.id);
    });
  }
);

export const toggleArticleFavoriteRoute = routeHandler(
  {
    body: z.object({
      favorite: z.boolean(),
    }),
    params: articleSlugDTO,
  },
  async (req) => {
    const currentUserId = getCurrentUserId(req);
    const { slug } = req.params;
    const { favorite } = req.body;

    const favoritesQuery = db.article.findBy({ slug }).favorites;
    if (favorite) {
      try {
        await favoritesQuery.create({
          userId: currentUserId,
        });
      } catch (err) {
        // ignore case when article is already favorited
        if (err instanceof db.articleFavorite.error && err.isUnique) {
          return;
        }
        throw err;
      }
    } else {
      await favoritesQuery
        .where({
          userId: currentUserId,
        })
        .delete();
    }
  }
);

export const deleteArticleRoute = routeHandler(
  {
    params: articleSlugDTO,
  },
  async (req) => {
    const currentUserId = getCurrentUserId(req);
    const { slug } = req.params;

    await db.$transaction(async () => {
      const article = await db.article
        .select('id', 'userId', {
          tagIds: (q) => q.tags.pluck('id'),
        })
        .findBy({ slug });

      if (article.userId !== currentUserId) {
        throw new UnauthorizedError();
      }

      const articleQuery = db.article.find(article.id);

      if (article.tagIds.length) {
        await articleQuery.articleTags.where().delete();
      }

      await articleQuery.delete();

      if (article.tagIds.length) {
        await tagRepo.whereIn('id', article.tagIds).deleteUnused();
      }
    });
  }
);
