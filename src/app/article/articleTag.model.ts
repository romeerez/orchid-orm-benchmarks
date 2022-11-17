import { Model } from '../../lib/model';
import { TagModel } from '../tag/tag.model';

export class ArticleTagModel extends Model {
  table = 'articleTag';
  columns = this.setColumns((t) => ({
    articleId: t.integer().foreignKey('article', 'id'),
    tagId: t.integer().foreignKey('tag', 'id'),
    ...t.primaryKey(['tagId', 'articleId']),
  }));

  relations = {
    tag: this.belongsTo(() => TagModel, {
      primaryKey: 'id',
      foreignKey: 'tagId',
    }),
  };
}
