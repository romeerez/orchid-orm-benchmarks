import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('postTag', (t) => ({
    postId: t.integer().foreignKey('post', 'id'),
    tagName: t.text().foreignKey('tag', 'name'),
    ...t.primaryKey(['postId', 'tagName']),
  }));
});
