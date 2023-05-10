import Knex from 'knex';
import { config, poolSize } from '../config';

export const knex = Knex({
  client: 'pg',
  connection: config.databaseUrl,
  pool: {
    min: poolSize,
    max: poolSize,
  },
});
