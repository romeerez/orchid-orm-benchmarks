import { makeDB, runBenchmark } from '../utils/utils';
import {
  CommentRecord,
  db,
  PostRecord,
  PostTagRecord,
  UserRecord,
} from '../orms/orchidOrm';
import { prisma } from '../orms/prisma';
import {
  sequelize,
  SequelizeComment,
  SequelizePostTag,
  SequelizeUser,
} from '../orms/sequelize';
import { databaseURLs } from '../config';

const recordsCount = 30;
const tagsPerPost = 5;
const commentsPerPost = 10;

const prepare = async (url: string) => {
  const db = makeDB(url);
  await db.connect();

  for (const table of ['user', 'post', 'tag', 'comment']) {
    await db.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
  }

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
      FROM generate_series(1, $1) AS t(i)
    `,
    [recordsCount]
  );

  await db.query(
    `
      INSERT INTO "post"("userId", "title", "description")
      SELECT
        "user"."id",
        'Post title ' || "user"."id",
        'Post description ' || "user"."id"
      FROM "user"
      ORDER BY "user"."id"
    `
  );

  await db.query(
    `
      INSERT INTO "tag"("name")
      SELECT 'tag-' || "user"."id"
      FROM "user"
      ORDER BY "user"."id"
    `
  );

  await db.query(
    `
      INSERT INTO "postTag"("postId", "tagName")
      SELECT "post"."id", "tag"."name"
      FROM "post"
      JOIN (SELECT * FROM "tag" LIMIT $1) "tag" ON true
    `,
    [tagsPerPost]
  );

  await db.query(
    `
      INSERT INTO "comment"("postId", "userId", "text")
      SELECT "post"."id", "user"."id", 'Comment text ' || "user"."id"
      FROM "post"
      JOIN (SELECT "user"."id" FROM "user" LIMIT $1) "user" ON true
      ORDER BY "post"."id"
    `,
    [commentsPerPost]
  );

  await db.end();
};

export const run = async (orm?: string) => {
  return runBenchmark(
    { orm },
    {
      orchidOrm: {
        start: () => prepare(databaseURLs.orchid),
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
        async start() {
          await prepare(databaseURLs.prisma);
          await prisma.$connect();
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
        async start() {
          await prepare(databaseURLs.sequelize);
          await sequelize.authenticate();
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
