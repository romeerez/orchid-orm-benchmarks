import { change } from '../scripts/db';

change(async (db) => {
  await db.createTable('tag', (t) => ({
    name: t.text().primaryKey(),
  }));
});
