import { Model } from '../../lib/model';

export class ArticleFavoriteModel extends Model {
  table = 'articleFavorite';
  columns = this.setColumns((t) => ({
    userId: t.integer().foreignKey('user', 'id'),
    articleId: t.integer().foreignKey('article', 'id'),
    ...t.primaryKey(['userId', 'articleId']),
  }));
}
