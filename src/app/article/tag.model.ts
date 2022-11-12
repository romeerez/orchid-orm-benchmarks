import { Model } from '../../lib/model';

export class TagModel extends Model {
  table = 'tag';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    name: t.text().min(3).max(20),
    ...t.timestamps(),
  }));
}
