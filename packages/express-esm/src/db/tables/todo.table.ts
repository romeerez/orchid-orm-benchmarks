import { BaseTable } from '../baseTable';

export class TodoTable extends BaseTable {
  readonly table = 'todo';
  columns = this.setColumns((t) => ({
    id: t.identity().primaryKey(),
    text: t.text(3, 10000),
    done: t.boolean().default(false),
    ...t.timestamps(),
  }));
}
