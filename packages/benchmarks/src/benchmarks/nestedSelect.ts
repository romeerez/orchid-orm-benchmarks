import { getUserInsertData, runBenchmark } from '../utils/utils';
import {
  CommentRecord,
  db,
  PostRecord,
  PostTagRecord,
  UserRecord,
} from '../orms/porm';
import { prisma } from '../orms/prisma';
import {
  sequelize,
  SequelizeComment,
  SequelizePostTag,
  SequelizeUser,
} from '../orms/sequelize';
import { kysely } from '../orms/kysely';

// const runTimes = 500;
const runTimes = 1;
const recordsCount = 30;
const tagsPerPost = 5;
const commentsPerPost = 3;

const prepare = async () => {
  await db.user.truncate({ cascade: true });
  await db.post.truncate({ cascade: true });
  await db.tag.truncate({ cascade: true });
  await db.comment.truncate({ cascade: true });

  const userIds = await db.user
    .pluck('id')
    .createMany(
      Array.from({ length: recordsCount }).map((_, i) => getUserInsertData(i))
    );

  let userI = 0;
  const getUserId = () => {
    if (userI === userIds.length) userI = 0;
    return userIds[userI++];
  };

  const tagNames = await db.tag.pluck('name').createMany(
    Array.from({ length: recordsCount }).map((_, i) => ({
      name: `tag-${i}`,
    }))
  );

  let tagI = 0;
  const getTag = () => {
    if (tagI === tagNames.length) tagI = 0;
    return tagNames[tagI++];
  };

  await db.post.pluck('id').createMany(
    Array.from({ length: recordsCount }).map((_, i) => ({
      userId: userIds[i],
      title: `Post title ${i}`,
      description: `Post description ${i}`,
      postTags: {
        create: Array.from({ length: tagsPerPost }).map(() => ({
          tagName: getTag(),
        })),
      },
      comments: {
        create: Array.from({ length: commentsPerPost }).map((_, i) => ({
          userId: getUserId(),
          text: `Comment text ${i}`,
        })),
      },
    }))
  );
};

export const run = async (orm?: string) => {
  await prepare();

  return runBenchmark(
    { orm, runTimes },
    {
      porm: {
        async run() {
          await db.post
            .select('id', 'title', 'description', {
              author: (q) => q.author.select('id', 'firstName', 'lastName'),
              tags: (q) => q.postTags.pluck('tagName'),
              lastComments: (q) =>
                q.comments
                  .select('id', 'text', {
                    author: (q) =>
                      q.author.select('id', 'firstName', 'lastName'),
                  })
                  .order({ createdAt: 'DESC' })
                  .limit(commentsPerPost),
            })
            .order({ createdAt: 'DESC' });
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
          const result = await prisma.post.findMany({
            select: {
              id: true,
              title: true,
              description: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
              postTag: {
                select: {
                  tagName: true,
                },
              },
              comment: {
                select: {
                  id: true,
                  text: true,
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: commentsPerPost,
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          result.map((post) => ({
            id: post.id,
            title: post.title,
            description: post.description,
            author: post.user,
            tags: post.postTag.map((tag) => tag.tagName),
            lastComments: post.comment,
          }));
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
          type Result = Pick<PostRecord, 'id' | 'title' | 'description'> & {
            author: Pick<UserRecord, 'id' | 'firstName' | 'lastName'>;
            postTags: Pick<PostTagRecord, 'tagName'>[];
            comments: (Pick<CommentRecord, 'id' | 'text' | 'userId'> & {
              author: Pick<UserRecord, 'id' | 'firstName' | 'lastName'>;
            })[];
          };

          const result = await sequelize.post.findAll({
            attributes: ['id', 'title', 'description'],
            include: [
              {
                model: SequelizeUser,
                as: 'author',
                attributes: ['id', 'firstName', 'lastName'],
              },
              {
                model: SequelizePostTag,
                as: 'postTags',
                attributes: ['tagName'],
              },
              {
                model: SequelizeComment,
                as: 'comments',
                attributes: ['id', 'text', 'userId'],
                separate: true,
                limit: commentsPerPost,
                include: [
                  {
                    model: SequelizeUser,
                    as: 'author',
                    attributes: ['id', 'firstName', 'lastName'],
                  },
                ],
              },
            ],
          });

          (result as unknown as Result[]).map((post) => ({
            id: post.id,
            title: post.title,
            description: post.description,
            author: post.author,
            tags: post.postTags.map((tag) => tag.tagName),
            comments: post.comments.map((comment) => ({
              id: comment.id,
              text: comment.text,
              author: {
                id: comment.author.id,
                firstName: comment.author.firstName,
                lastName: comment.author.lastName,
              },
            })),
          }));
        },
        stop() {
          return sequelize.close();
        },
      },
    }
  );
};
