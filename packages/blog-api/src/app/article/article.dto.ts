import { z } from 'zod';
import { userDTO } from '../user/user.dto';
import { ArticleTable } from './article.table';
import { TagTable } from '../tag/tag.table';

const tagListDTO = TagTable.schema().shape.name.array();

export const articleDTO = ArticleTable.schema()
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
      tags: tagListDTO,
      favorited: z.boolean(),
      author: userDTO,
    })
  );

export const articleCreateDTO = ArticleTable.schema()
  .pick({
    slug: true,
    title: true,
    body: true,
  })
  .extend({
    tags: tagListDTO,
  });

export const articleUpdateDTO = articleCreateDTO
  .extend({
    favorite: z.boolean(),
  })
  .partial();

export const articleSlugDTO = ArticleTable.schema().pick({ slug: true });
