import { articleSchema } from './article.model';
import { z } from 'zod';
import { userDto } from '../user/user.dto';

export const articleDto = articleSchema
  .pick({
    slug: true,
    title: true,
    body: true,
    favoritesCount: true,
    createdAt: true,
    updatedAt: true,
  })
  .and(
    z.object({
      tags: z.string().array(),
      favorited: z.boolean(),
      author: userDto,
    })
  );
