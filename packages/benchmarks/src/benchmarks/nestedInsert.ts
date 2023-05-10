import { db } from '../orms/orchidOrm';
import { dbClient, runBenchmark } from '../utils/utils';
import { prisma } from '../orms/prisma';

export const run = async (orm?: string) => {
  await dbClient.connect();
  await dbClient.query(`TRUNCATE TABLE "tag" RESTART IDENTITY CASCADE`);
  await dbClient.query(`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE`);

  let i = 0;

  const tagNames = ['one', 'two', 'three', 'four', 'five'];
  await dbClient.query(
    `
      INSERT INTO "tag"("name")
      VALUES ${tagNames.map((tag) => `('${tag}')`).join(', ')}
    `
  );

  const {
    rows: [{ id: userId }],
  } = await dbClient.query<{ id: number }>(
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
      RETURNING "id"
    `
  );

  const postData = {
    userId,
    title: 'Post title',
    description: 'Post description',
  };

  const commentData = {
    userId,
    text: 'Comment text',
  };

  await runBenchmark(
    {
      orm,
      async beforeEach() {
        i = 0;
        // cascade will also truncate postTags and comments
        await dbClient.query(`TRUNCATE TABLE "post" RESTART IDENTITY CASCADE`);
      },
    },
    {
      orchidOrm: {
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
      },
      prisma: {
        start() {
          return prisma.$connect();
        },
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
        stop() {
          return prisma.$disconnect();
        },
      },
    }
  );

  await dbClient.end();
};
