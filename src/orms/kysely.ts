import { Kysely, PostgresDialect } from 'kysely';
import {
  CommentRecord,
  PostRecord,
  PostTagRecord,
  TagRecord,
  UserRecord,
} from './orchidOrm';
import { Pool } from 'pg';
import { databaseURLs, poolSize } from '../config';

interface Database {
  user: UserRecord;
  post: PostRecord;
  tag: TagRecord;
  postTag: PostTagRecord;
  comment: CommentRecord;
}

export const kysely = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: databaseURLs.kysely,
      max: poolSize,
      min: poolSize,
    }),
  }),
});
