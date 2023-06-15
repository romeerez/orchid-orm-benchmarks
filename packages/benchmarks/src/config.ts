import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const env = z
  .object({
    DATABASE_URL: z.string(),
  })
  .parse(process.env);

const url = env.DATABASE_URL;

export const databaseURLs = {
  prisma: url,
  orchid: `${url}-orchid`,
  sequelize: `${url}-sequelize`,
  knex: `${url}-knex`,
  kysely: `${url}-kysely`,
};

export const poolSize = 10;
