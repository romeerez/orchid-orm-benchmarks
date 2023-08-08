import { BaseTable } from '../../lib/baseTable';
import { ArticleTagTable } from '../article/articleTag.table';

export class TagTable extends BaseTable {
  readonly table = 'tag';
  columns = this.setColumns((t) => ({
    id: t.identity().primaryKey(),
    name: t.text().min(3).max(20),
    ...t.timestamps(),
  }));

  relations = {
    articleTags: this.hasMany(() => ArticleTagTable, {
      columns: ['id'],
      references: ['tagId'],
    }),
  };
}
