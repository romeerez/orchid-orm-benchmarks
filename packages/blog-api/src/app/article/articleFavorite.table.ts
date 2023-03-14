import { BaseTable } from '../../lib/baseTable';

export class ArticleFavoriteTable extends BaseTable {
  readonly table = 'articleFavorite';
  columns = this.setColumns((t) => ({
    userId: t.integer().foreignKey('user', 'id'),
    articleId: t.integer().foreignKey('article', 'id'),
    ...t.primaryKey(['userId', 'articleId']),
  }));
}
