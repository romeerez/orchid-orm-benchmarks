import { dbClient, runBenchmark } from '../utils/utils';
import { db } from '../orms/orchidOrm';
import { prisma } from '../orms/prisma';
import { sequelize } from '../orms/sequelize';
import { kysely } from '../orms/kysely';
import { knex } from '../orms/knex';
import * as zapatos from 'zapatos/db';
import type * as s from 'zapatos/schema';
import { pool } from '../orms/zapatos/pool';

const recordsCount = 100;

const prepare = async () => {
  await dbClient.connect();
  await dbClient.query(`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE`);
  await dbClient.query(
    `
    INSERT INTO "user"("email", "firstName", "lastName", "bio", "age", "city", "country")
    SELECT
      'email-' || i || '@mail.com',
      'first name',
      'last name',
      'user biography sentence is written in the bio column of the user table',
      30,
      'some city',
      'nice country'
    FROM generate_series(1, $1) AS t(i);
  `,
    [recordsCount]
  );
  await dbClient.end();
};

export const run = async (orm?: string) => {
  await prepare();

  return runBenchmark(
    { orm },
    {
      orchidOrm: {
        async run() {
          await db.user;
        },
        async stop() {
          return db.$close();
        },
      },
      prisma: {
        start() {
          return prisma.$connect();
        },
        async run() {
          await prisma.user.findMany();
        },
        stop() {
          return prisma.$disconnect();
        },
      },
      sequelize: {
        start() {
          return sequelize.authenticate();
        },
        async run() {
          await sequelize.user.findAll();
        },
        stop() {
          return sequelize.close();
        },
      },
      kysely: {
        async run() {
          await kysely.selectFrom('user').selectAll('user').execute();
        },
        stop() {
          return kysely.destroy();
        },
      },
      knex: {
        async run() {
          await knex('user');
        },
        stop() {
          return knex.destroy();
        },
      },
      zapatos: {
        async run() {
          await zapatos.sql<
            s.user.SQL,
            s.user.Selectable[]
          >`SELECT * FROM ${'user'}`.run(pool);
        },
        stop() {
          return pool.end();
        },
      },
    }
  );
};
