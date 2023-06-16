import { change } from '../dbScript';

change(async (db) => {
  await db.createTable('todo', (t) => ({
    id: t.identity().primaryKey(),
    text: t.text(),
    done: t.boolean().default(false),
    ...t.timestamps(),
  }));
});
