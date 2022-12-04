import { orchidORM } from 'orchid-orm';
import { config } from './config';
import { UserModel } from './app/user/user.model';
import { UserFollowModel } from './app/user/userFollow.model';
import { ArticleModel } from './app/article/article.model';
import { ArticleTagModel } from './app/article/articleTag.model';
import { TagModel } from './app/tag/tag.model';
import { ArticleFavoriteModel } from './app/article/articleFavorite.model';

export const db = orchidORM(
  {
    databaseURL: config.currentDatabaseUrl,
    log: true,
  },
  {
    user: UserModel,
    userFollow: UserFollowModel,
    article: ArticleModel,
    articleFavorite: ArticleFavoriteModel,
    articleTag: ArticleTagModel,
    tag: TagModel,
  }
);
