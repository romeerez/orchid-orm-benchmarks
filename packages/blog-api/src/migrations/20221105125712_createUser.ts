import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('user', (t) => ({
    id: t.serial().primaryKey(),
    username: t.text().unique().max(30),
    email: t.text().unique().email().max(100),
    password: t.text().min(8),
    ...t.timestamps(),
  }));
});
