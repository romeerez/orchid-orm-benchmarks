import { orchidORM } from 'orchid-orm';
import { config } from './config';
import { UserTable } from './app/user/user.table';
import { UserFollowTable } from './app/user/userFollow.table';
import { ArticleTable } from './app/article/article.table';
import { ArticleTagTable } from './app/article/articleTag.table';
import { TagTable } from './app/tag/tag.table';
import { ArticleFavoriteTable } from './app/article/articleFavorite.table';

export const db = orchidORM(
  {
    databaseURL: config.currentDatabaseUrl,
    log: true,
  },
  {
    user: UserTable,
    userFollow: UserFollowTable,
    article: ArticleTable,
    articleFavorite: ArticleFavoriteTable,
    articleTag: ArticleTagTable,
    tag: TagTable,
  }
);
