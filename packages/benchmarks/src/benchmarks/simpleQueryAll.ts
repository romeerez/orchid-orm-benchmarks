import { getUserInsertData, runBenchmark } from '../utils/utils';
import { db } from '../orms/orchidOrm';
import { prisma } from '../orms/prisma';
import { sequelize } from '../orms/sequelize';
import { kysely } from '../orms/kysely';
import { knex } from '../orms/knex';
import * as zapatos from 'zapatos/db';
import type * as s from 'zapatos/schema';
import { pool } from '../orms/zapatos/pool';

const recordsCount = 100;
const runTimes = 1000;

const prepare = async () => {
  const data: typeof db.user['inputType'][] = Array.from({
    length: recordsCount,
  }).map((_, i) => getUserInsertData(i));

  await db.user.truncate({ cascade: true });
  await db.user.createMany(data);
};

export const run = async (orm?: string) => {
  await prepare();
  return runBenchmark(
    { orm, runTimes },
    {
      orchidOrm: {
        async run() {
          await db.user;
        },
        stop() {
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
        async start() {
          await kysely.selectFrom('user').select(['id']).executeTakeFirst();
        },
        async run() {
          await kysely.selectFrom('user').selectAll('user').execute();
        },
        stop() {
          return kysely.destroy();
        },
      },
      knex: {
        async start() {
          return knex.select(knex.raw('1'));
        },
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
