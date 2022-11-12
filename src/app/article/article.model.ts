import { Model } from '../../lib/model';
import { UserModel } from '../user/user.model';
import { ArticleTagModel } from './articleTag.model';
import { TagModel } from './tag.model';
import { ArticleFavoriteModel } from './articleFavorite.model';
import { modelToZod } from 'porm-schema-to-zod';

export class ArticleModel extends Model {
  table = 'article';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    userId: t.integer().foreignKey('user', 'id').index(),
    slug: t.text().unique().min(10).max(200),
    title: t.text().min(10).max(200),
    body: t.text().min(100).max(100000),
    favoritesCount: t.integer(),
    ...t.timestamps(),
  }));

  relations = {
    author: this.belongsTo(() => UserModel, {
      primaryKey: 'id',
      foreignKey: 'userId',
    }),

    favorites: this.hasMany(() => ArticleFavoriteModel, {
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),

    articleTags: this.hasMany(() => ArticleTagModel, {
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),

    tags: this.hasMany(() => TagModel, {
      through: 'articleTags',
      source: 'tag',
    }),
  };
}

export const articleSchema = modelToZod(ArticleModel);
