import { rakeDb } from 'rake-db';
import { config } from '../config';
import { appCodeUpdater } from 'orchid-orm/codegen';
import { BaseTable } from '../lib/baseTable';

const options = [{ databaseURL: config.DATABASE_URL }];
if (config.NODE_ENV !== 'production') {
  const url = config.DATABASE_URL_TEST;
  if (!url) {
    throw new Error('DATABASE_URL_TEST env variable is missing');
  }
  options.push({ databaseURL: url });
}

export const change = rakeDb(options, {
  baseTable: BaseTable,
  migrationsPath: '../migrations',
  appCodeUpdater: appCodeUpdater({
    tablePath: (tableName) => `../app/tables/${tableName}.ts`,
    ormPath: '../db.ts',
  }),
  useCodeUpdater: false,
});
