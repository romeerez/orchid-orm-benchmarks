import path from 'path';
import { rakeDb } from 'rake-db';
import { config } from '../config';

const migrationsPath = path.resolve(__dirname, '..', 'migrations');

const options = [{ databaseURL: config.DATABASE_URL }];
if (config.NODE_ENV !== 'production') {
  const url = config.DATABASE_URL_TEST;
  if (!url) {
    throw new Error('DATABASE_URL_TEST env variable is missing');
  }
  options.push({ databaseURL: url });
}

rakeDb(options, { migrationsPath });
