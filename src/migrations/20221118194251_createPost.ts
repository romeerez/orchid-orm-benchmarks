import { change } from '../scripts/db';

change(async (db) => {
  await db.createTable('post', (t) => ({
    id: t.serial().primaryKey(),
    userId: t.integer().foreignKey('user', 'id'),
    title: t.text(),
    description: t.text(),
    ...t.timestamps(),
  }));
});
