import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const env = z
  .object({
    DATABASE_URL: z.string(),
  })
  .parse(process.env);

export const config = {
  databaseUrl: env.DATABASE_URL,
};
