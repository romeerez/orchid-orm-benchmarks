import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('articleTag', (t) => ({
    articleId: t.integer().foreignKey('article', 'id'),
    tagId: t.integer().foreignKey('tag', 'id'),
    ...t.primaryKey(['tagId', 'articleId']),
  }));
});
