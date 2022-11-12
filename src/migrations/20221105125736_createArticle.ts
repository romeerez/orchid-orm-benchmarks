import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('article', (t) => ({
    id: t.serial().primaryKey(),
    userId: t.integer().foreignKey('user', 'id').index(),
    slug: t.text().unique(),
    title: t.text(),
    body: t.text(),
    favoritesCount: t.integer(),
    ...t.timestamps(),
  }));
});
