import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('tag', (t) => ({
    id: t.serial().primaryKey(),
    name: t.text(),
    ...t.timestamps(),
  }));
});
