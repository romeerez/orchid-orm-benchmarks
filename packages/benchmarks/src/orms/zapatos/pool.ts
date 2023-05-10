import { Pool } from 'pg';
import { config, poolSize } from '../../config';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: poolSize,
  min: poolSize,
});
