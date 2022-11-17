import { Model } from '../../lib/model';
import { modelToZod } from 'porm-schema-to-zod';
import { ArticleTagModel } from '../article/articleTag.model';

export class TagModel extends Model {
  table = 'tag';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    name: t.text().min(3).max(20),
    ...t.timestamps(),
  }));

  relations = {
    articleTags: this.hasMany(() => ArticleTagModel, {
      primaryKey: 'id',
      foreignKey: 'tagId',
    }),
  };
}

export const tagSchema = modelToZod(TagModel);
