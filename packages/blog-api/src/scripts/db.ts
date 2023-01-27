import { rakeDb } from 'rake-db';
import { config } from '../config';
import { appCodeUpdater } from 'orchid-orm';

const options = [{ databaseURL: config.DATABASE_URL }];
if (config.NODE_ENV !== 'production') {
  const url = config.DATABASE_URL_TEST;
  if (!url) {
    throw new Error('DATABASE_URL_TEST env variable is missing');
  }
  options.push({ databaseURL: url });
}

rakeDb(options, {
  migrationsPath: 'src/migrations',
  appCodeUpdater: appCodeUpdater({
    tablePath: (tableName) => `src/app/tables/${tableName}.ts`,
    baseTablePath: 'src/lib/baseTable.ts',
    baseTableName: 'BaseTable',
    mainFilePath: 'src/db.ts',
  }),
});
