import 'dotenv/config';

const database = {
  databaseURL: process.env.DATABASE_URL,
};
if (!database.databaseURL) throw new Error('DATABASE_URL is missing in .env');

export const config = {
  database,
};
