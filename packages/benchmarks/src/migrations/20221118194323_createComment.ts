import { change } from '../scripts/db';

change(async (db) => {
  await db.createTable('comment', (t) => ({
    id: t.serial().primaryKey(),
    userId: t.integer().foreignKey('user', 'id').index(),
    postId: t.integer().foreignKey('post', 'id').index(),
    text: t.text(),
    ...t.timestamps(),
  }));
});
