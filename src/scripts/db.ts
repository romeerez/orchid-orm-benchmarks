import path from 'path';
import { rakeDb } from 'rake-db';
import { databaseURLs } from '../config';

const migrationsPath = path.resolve(__dirname, '..', 'migrations');

const allDatabases = Object.values(databaseURLs).map((databaseURL) => ({
  databaseURL,
}));

export const change = rakeDb(allDatabases, { migrationsPath });
