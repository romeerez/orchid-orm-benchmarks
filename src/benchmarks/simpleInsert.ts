import { db } from '../orms/orchidOrm';
import { makeDB, getUserInsertData, runBenchmark } from '../utils/utils';
import { prisma } from '../orms/prisma';
import { sequelize } from '../orms/sequelize';
import { kysely } from '../orms/kysely';
import { knex } from '../orms/knex';
import { databaseURLs } from '../config';

const prepare = async (url: string) => {
  const db = makeDB(url);
  await db.connect();
  await db.query(`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE`);
  await db.end();
};

export const run = async (orm?: string) => {
  await runBenchmark(
    {
      orm,
    },
    {
      orchidOrm: {
        prepare: () => prepare(databaseURLs.orchid),
        async run(i) {
          await db.user.count().create(getUserInsertData(i));
        },
        stop() {
          return db.$close();
        },
      },
      prisma: {
        prepare: () => prepare(databaseURLs.prisma),
        start: () => prisma.$connect(),
        async run(i) {
          await prisma.user.create({
            select: null,
            data: getUserInsertData(i),
          });
        },
        stop() {
          return prisma.$disconnect();
        },
      },
      sequelize: {
        prepare: () => prepare(databaseURLs.sequelize),
        start: () => sequelize.authenticate(),
        async run(i) {
          await sequelize.user.create(getUserInsertData(i), {
            returning: false,
          });
        },
        stop() {
          return sequelize.close();
        },
      },
      kysely: {
        prepare: () => prepare(databaseURLs.kysely),
        async run(i) {
          await kysely
            .insertInto('user')
            // using `never` type because I didn't find how to insert into user without id, createdAt, and updatedAt
            .values(getUserInsertData(i) as never)
            .execute();
        },
        stop() {
          return kysely.destroy();
        },
      },
      knex: {
        prepare: () => prepare(databaseURLs.knex),
        async run(i) {
          await knex('user').insert(getUserInsertData(i));
        },
        stop() {
          return knex.destroy();
        },
      },
    }
  );
};
