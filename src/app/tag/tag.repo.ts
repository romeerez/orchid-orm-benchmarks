import { createRepo } from 'porm';
import { db } from '../../db';

export const tagRepo = createRepo(db.tag, {
  queryMethods: {
    deleteUnused(q) {
      return q.whereNotExists('articleTags').delete();
    },
  },
});
