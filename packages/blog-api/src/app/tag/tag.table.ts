import { BaseTable } from '../../lib/baseTable';
import { tableToZod } from 'orchid-orm-schema-to-zod';
import { ArticleTagTable } from '../article/articleTag.table';

export class TagTable extends BaseTable {
  readonly table = 'tag';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    name: t.text().min(3).max(20),
    ...t.timestamps(),
  }));

  relations = {
    articleTags: this.hasMany(() => ArticleTagTable, {
      primaryKey: 'id',
      foreignKey: 'tagId',
    }),
  };
}

export const tagSchema = tableToZod(TagTable);
