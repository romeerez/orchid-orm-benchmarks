import { porm } from 'porm';
import { config } from './config';

export const db = porm(
  {
    connectionString: config.currentDatabaseUrl,
    log: true,
  },
  {
    // models will be listed here
  }
);
