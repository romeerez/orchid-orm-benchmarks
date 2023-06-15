import { db } from '../orms/orchidOrm';
import { dbClient, getUserInsertData, runBenchmark } from '../utils/utils';
import { prisma } from '../orms/prisma';
import { sequelize } from '../orms/sequelize';
import { kysely } from '../orms/kysely';
import { knex } from '../orms/knex';
import * as zapatos from 'zapatos/db';
import { pool } from '../orms/zapatos/pool';

export const run = async (orm?: string) => {
  let i = 0;

  await dbClient.connect();

  await runBenchmark(
    {
      orm,
      async beforeEach() {
        i = 0;
        await dbClient.query(`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE`);
      },
    },
    {
      orchidOrm: {
        async run() {
          await db.user.count().create(getUserInsertData(i++));
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
          await prisma.user.create({
            select: null,
            data: getUserInsertData(i++),
          });
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
          await sequelize.user.create(getUserInsertData(i++), {
            returning: false,
          });
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
          await kysely
            .insertInto('user')
            // using `never` type because I didn't find how to insert into user without id, createdAt, and updatedAt
            .values(getUserInsertData(i++) as never)
            .execute();
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
          await knex('user').insert(getUserInsertData(i++));
        },
        stop() {
          return knex.destroy();
        },
      },
      zapatos: {
        async run() {
          await zapatos.insert('user', getUserInsertData(i++)).run(pool);
        },
        stop() {
          return pool.end();
        },
      },
    }
  );

  await dbClient.end();
};
