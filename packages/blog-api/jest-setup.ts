import {
  patchPgForTransactions,
  startTransaction,
  rollbackTransaction,
} from 'pg-transactional-tests';
import { db } from './src/db';

patchPgForTransactions();

beforeAll(startTransaction);
beforeEach(startTransaction);
afterEach(rollbackTransaction);
afterAll(async () => {
  await rollbackTransaction();
  await db.$close();
});
