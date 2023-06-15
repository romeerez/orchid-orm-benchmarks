import Knex from 'knex';
import { databaseURLs, poolSize } from '../config';

export const knex = Knex({
  client: 'pg',
  connection: databaseURLs.knex,
  pool: {
    min: poolSize,
    max: poolSize,
  },
});
