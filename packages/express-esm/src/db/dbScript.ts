import { rakeDb } from 'rake-db';
import { appCodeUpdater } from 'orchid-orm/codegen';
import { config } from './config';
import { BaseTable } from './baseTable';

export const change = rakeDb(config.database, {
  baseTable: BaseTable,
  migrationsPath: './migrations',
  appCodeUpdater: appCodeUpdater({
    tablePath: (tableName) => `./tables/${tableName}.table.ts`,
    ormPath: './db.ts',
  }),
  // set to false to disable code updater
  useCodeUpdater: true,
  // needed for ESM
  import: (path) => import(path),
});
