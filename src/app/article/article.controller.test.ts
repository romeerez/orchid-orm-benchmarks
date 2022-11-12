import { articleFactory, userFactory } from '../../lib/test/testFactories';
import { testRequest } from '../../lib/test/testRequest';

describe('article controller', () => {
  describe('GET /articles', () => {
    it('should load articles for public request, favorited and author following fields must be false, newer articles should go first', async () => {
      const author = await userFactory.create();
      await articleFactory.createList(2, { userId: author.id });

      const res = await testRequest.get('/articles');

      const data = res.json();
      expect(data.length).toBe(2);

      const [first, second] = data;
      expect(first.favorited).toBe(false);
      expect(first.author.following).toBe(false);
      expect(first.createdAt).toBeGreaterThan(second.createdAt);
    });

    it('should load articles for authorized user, favorited and author following fields must have proper values, newer articles should go first', async () => {
      const currentUser = await userFactory.create();

      const notFollowedAuthor = await userFactory.create();
      await articleFactory.create({ userId: notFollowedAuthor.id });

      const followedAuthor = await userFactory.create({
        follows: {
          create: [
            {
              followerId: currentUser.id,
            },
          ],
        },
      });

      await articleFactory.create({
        userId: followedAuthor.id,
        favorites: {
          create: [
            {
              userId: currentUser.id,
            },
          ],
        },
      });

      const res = await testRequest.as(currentUser).get('/articles');

      const data = res.json();
      const [first, second] = data;

      expect(second.favorited).toBe(false);
      expect(second.author.following).toBe(false);

      expect(first.favorited).toBe(true);
      expect(first.author.following).toBe(true);
    });

    describe('query params', () => {
      describe('author', () => {
        it('should filter articles by username of author', async () => {
          const [author1, author2] = await userFactory.createList(2);

          await articleFactory.create({ userId: author1.id });
          await articleFactory.create({ userId: author2.id });

          const res = await testRequest.get('/articles', {
            query: {
              author: author1.username,
            },
          });

          const data = res.json();
          expect(data.length).toBe(1);
          expect(data[0].author.username).toBe(author1.username);
        });
      });

      describe('tag', () => {
        it('should filter articles by tag', async () => {
          const author = await userFactory.create();

          // create article with matching tag
          await articleFactory.create({
            userId: author.id,
            articleTags: {
              create: ['one', 'two'].map((name) => ({
                tag: {
                  create: {
                    name,
                  },
                },
              })),
            },
          });

          // create article with different tags
          await articleFactory.create({
            userId: author.id,
            articleTags: {
              create: ['three', 'four'].map((name) => ({
                tag: {
                  create: {
                    name,
                  },
                },
              })),
            },
          });

          // create article without tags
          await articleFactory.create({ userId: author.id });

          const res = await testRequest.get('/articles', {
            query: {
              tag: 'one',
            },
          });

          const data = res.json();
          expect(data.length).toBe(1);
          expect(data[0].tags).toEqual(['one', 'two']);
        });
      });

      describe('feed', () => {
        it('should return unauthorized error for not authorized request', async () => {
          const res = await testRequest.get('/articles', {
            query: {
              feed: 'true',
            },
          });

          expect(res.json()).toEqual({
            message: 'Unauthorized',
          });
        });

        it('should return articles from followed authors for authorized user', async () => {
          const currentUser = await userFactory.create();
          const unfollowedAuthor = await userFactory.create();
          const followedAuthor = await userFactory.create({
            follows: {
              create: [
                {
                  followerId: currentUser.id,
                },
              ],
            },
          });

          const expectedArticles = await articleFactory.createList(2, {
            userId: followedAuthor.id,
          });

          await articleFactory.createList(2, {
            userId: unfollowedAuthor.id,
          });

          const res = await testRequest.as(currentUser).get('/articles', {
            query: {
              feed: 'true',
            },
          });

          const data = res.json();
          expect(data.length).toBe(2);
          expect(data).toMatchObject(
            expectedArticles
              .reverse()
              .map((article) => ({ slug: article.slug }))
          );
        });
      });

      describe('favorite', () => {
        it('should return unauthorized error for not authorized request', async () => {
          const res = await testRequest.get('/articles', {
            query: {
              favorite: 'true',
            },
          });

          expect(res.json()).toEqual({
            message: 'Unauthorized',
          });
        });

        it('should returns only articles favorited by current user', async () => {
          const [currentUser, author] = await userFactory.createList(2);

          const favoritedArticles = await articleFactory.createList(2, {
            userId: author.id,
            favorites: {
              create: [
                {
                  userId: currentUser.id,
                },
              ],
            },
          });

          await articleFactory.create({ userId: author.id });

          const res = await testRequest.as(currentUser).get('/articles', {
            query: {
              favorite: 'true',
            },
          });

          const data = res.json();
          expect(data).toMatchObject(
            favoritedArticles
              .reverse()
              .map((article) => ({ slug: article.slug }))
          );
        });
      });
    });
  });
});
