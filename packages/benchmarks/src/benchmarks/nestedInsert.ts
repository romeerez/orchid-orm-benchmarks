import { db } from '../orms/orchidOrm';
import { makeDB, runBenchmark } from '../utils/utils';
import { prisma } from '../orms/prisma';
import { databaseURLs } from '../config';

const tagNames = ['one', 'two', 'three', 'four', 'five'];

const start = async (url: string) => {
  const db = makeDB(url);
  await db.connect();
  await db.query(`TRUNCATE TABLE "tag" RESTART IDENTITY CASCADE`);
  await db.query(`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE`);

  await db.query(
    `
      INSERT INTO "tag"("name") VALUES ${tagNames
        .map((tag) => `('${tag}')`)
        .join(', ')}
    `
  );

  await db.query<{ id: number }>(
    `
      INSERT INTO "user"("email", "firstName", "lastName", "bio", "age", "city", "country")
      VALUES (
        'email@mail.com',
        'first name',
        'last name',
        'user biography sentence is written in the bio column of the user table',
        30,
        'some city',
        'nice country'
      ) 
    `
  );

  await db.end();
};

const prepare = async (url: string) => {
  const db = makeDB(url);
  await db.connect();
  await db.query(`TRUNCATE TABLE "post" RESTART IDENTITY CASCADE`);
  await db.end();
};

export const run = async (orm?: string) => {
  const postData = {
    userId: 1,
    title: 'Post title',
    description: 'Post description',
  };

  const commentData = {
    userId: 1,
    text: 'Comment text',
  };

  await runBenchmark(
    {
      orm,
    },
    {
      orchidOrm: {
        start: () => start(databaseURLs.orchid),
        prepare: () => prepare(databaseURLs.orchid),
        async run() {
          await db.post.count().create({
            ...postData,
            comments: {
              create: [commentData, commentData, commentData],
            },
            postTags: {
              create: tagNames.map((tagName) => ({ tagName })),
            },
          });
        },
        stop: () => db.$close(),
      },
      prisma: {
        async start() {
          await start(databaseURLs.prisma);
          await prisma.$connect();
        },
        prepare: () => prepare(databaseURLs.prisma),
        async run() {
          await prisma.post.create({
            select: null,
            data: {
              ...postData,
              comment: {
                create: [commentData, commentData, commentData],
              },
              postTag: {
                create: tagNames.map((tagName) => ({ tagName })),
              },
            },
          });
        },
        stop: () => prisma.$disconnect(),
      },
    }
  );
};
