import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('user', (t) => ({
    id: t.serial().primaryKey(),
    email: t.text().unique(),
    firstName: t.text(),
    lastName: t.text(),
    bio: t.text(),
    age: t.integer(),
    city: t.text(),
    country: t.text(),
    ...t.timestamps(),
  }));
});
