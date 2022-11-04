import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const env = z
  .object({
    NODE_ENV: z
      .literal('development')
      .or(z.literal('production'))
      .default('development'),
    DATABASE_URL: z.string(),
  })
  .or(
    z.object({
      NODE_ENV: z.literal('test'),
      DATABASE_URL_TEST: z.string().optional(),
    })
  )
  .parse(process.env);

const logger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
}[env.NODE_ENV];

export const config = {
  ...env,
  logger,
  validateResponses: env.NODE_ENV !== 'production',
};
