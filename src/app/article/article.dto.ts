import { articleSchema } from './article.model';
import { userSchema } from '../user/user.model';
import { z } from 'zod';

export const articleDto = articleSchema
  .pick({
    slug: true,
    title: true,
    favoritesCount: true,
    createdAt: true,
    updatedAt: true,
  })
  .and(
    z.object({
      tags: z.string().array(),
      favorited: z.boolean(),
      author: userSchema
        .pick({
          username: true,
        })
        .and(
          z.object({
            following: z.boolean(),
          })
        ),
    })
  );
