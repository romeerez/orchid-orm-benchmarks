import { Model } from '../../lib/model';
import { modelToZod } from 'porm-schema-to-zod';

export class TagModel extends Model {
  table = 'tag';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    name: t.text().min(3).max(20),
    ...t.timestamps(),
  }));
}

export const tagSchema = modelToZod(TagModel);
