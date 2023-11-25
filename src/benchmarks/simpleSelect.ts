import { makeDB, runBenchmark } from '../utils/utils';
import { db } from '../orms/orchidOrm';
import { prisma } from '../orms/prisma';
import { sequelize } from '../orms/sequelize';
import { kysely } from '../orms/kysely';
import { knex } from '../orms/knex';
import { databaseURLs } from '../config';

const recordsCount = 100;

const prepare = async (url: string) => {
  const db = makeDB(url);
  await db.connect();
  await db.query(`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE`);
  await db.query(
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
  await db.end();
};

export const run = (orm?: string) => {
  return runBenchmark(
    { orm },
    {
      orchidOrm: {
        start: () => prepare(databaseURLs.orchid),
        async run() {
          await db.user;
        },
        async stop() {
          return db.$close();
        },
      },
      prisma: {
        async start() {
          await prepare(databaseURLs.prisma);
          await prisma.$connect();
        },
        async run() {
          await prisma.user.findMany();
        },
        stop() {
          return prisma.$disconnect();
        },
      },
      sequelize: {
        async start() {
          await prepare(databaseURLs.sequelize);
          await sequelize.authenticate();
        },
        async run() {
          await sequelize.user.findAll();
        },
        stop() {
          return sequelize.close();
        },
      },
      kysely: {
        start: () => prepare(databaseURLs.kysely),
        async run() {
          await kysely.selectFrom('user').selectAll('user').execute();
        },
        stop() {
          return kysely.destroy();
        },
      },
      knex: {
        start: () => prepare(databaseURLs.knex),
        async run() {
          await knex('user');
        },
        stop() {
          return knex.destroy();
        },
      },
    }
  );
};
