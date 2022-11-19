import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('comment', (t) => ({
    id: t.serial().primaryKey(),
    userId: t.integer().foreignKey('user', 'id'),
    postId: t.integer().foreignKey('post', 'id'),
    text: t.text(),
    ...t.timestamps(),
  }));
});
