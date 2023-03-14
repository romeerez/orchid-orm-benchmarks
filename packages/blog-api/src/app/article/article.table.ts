import { BaseTable } from '../../lib/baseTable';
import { UserTable } from '../user/user.table';
import { ArticleTagTable } from './articleTag.table';
import { TagTable } from '../tag/tag.table';
import { ArticleFavoriteTable } from './articleFavorite.table';
import { tableToZod } from 'orchid-orm-schema-to-zod';

export class ArticleTable extends BaseTable {
  readonly table = 'article';
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
    author: this.belongsTo(() => UserTable, {
      primaryKey: 'id',
      foreignKey: 'userId',
    }),

    favorites: this.hasMany(() => ArticleFavoriteTable, {
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),

    articleTags: this.hasMany(() => ArticleTagTable, {
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),

    tags: this.hasMany(() => TagTable, {
      through: 'articleTags',
      source: 'tag',
    }),
  };
}

export const articleSchema = tableToZod(ArticleTable);
