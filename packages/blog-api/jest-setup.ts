import { testTransaction } from 'orchid-orm';
import { db } from './src/db';

beforeAll(async () => {
  await testTransaction.start(db);
});

beforeEach(async () => {
  await testTransaction.start(db);
});

afterEach(async () => {
  await testTransaction.rollback(db);
});

afterAll(async () => {
  await testTransaction.close(db);
});
