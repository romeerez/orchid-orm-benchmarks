import { db } from '../orms/orchidOrm';
import { getUserInsertData, runBenchmark } from '../utils/utils';
import { prisma } from '../orms/prisma';
import { sequelize } from '../orms/sequelize';

const runTimes = 1000;

export const run = async (orm?: string) => {
  await db.tag.truncate({ cascade: true });
  await db.user.truncate({ cascade: true });

  let i = 0;

  const tagNames = ['one', 'two', 'three', 'four', 'five'];
  await db.tag.createMany(tagNames.map((name) => ({ name })));

  const userId = await db.user.get('id').create(getUserInsertData(0));

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
      runTimes,
      async beforeEach() {
        i = 0;
        // cascade will also truncate postTags and comments
        await db.post.truncate({ cascade: true });
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
      sequelize: {
        start() {
          return sequelize.authenticate();
        },
        async run() {
          await sequelize.post.create(postData, {
            returning: false,
            include: [
              {
                association: 'comments',
              },
            ],
          });
        },
        stop() {
          return sequelize.close();
        },
      },
    }
  );

  await db.$close();
};
