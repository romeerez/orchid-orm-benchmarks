import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('tag', (t) => ({
    name: t.text().primaryKey(),
  }));
});
