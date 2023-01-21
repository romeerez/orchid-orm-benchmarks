import { BaseTable } from '../../lib/baseTable';
import { TagTable } from '../tag/tag.table';

export class ArticleTagTable extends BaseTable {
  table = 'articleTag';
  columns = this.setColumns((t) => ({
    articleId: t.integer().foreignKey('article', 'id'),
    tagId: t.integer().foreignKey('tag', 'id'),
    ...t.primaryKey(['tagId', 'articleId']),
  }));

  relations = {
    tag: this.belongsTo(() => TagTable, {
      primaryKey: 'id',
      foreignKey: 'tagId',
    }),
  };
}
