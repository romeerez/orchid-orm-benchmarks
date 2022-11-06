import { testRequest } from '../../lib/test/testRequest';
import { userFactory } from '../../lib/test/testFactories';
import { db } from '../../db';
import { verifyToken } from '../../lib/jwt';
import { comparePassword } from '../../lib/password';

describe('user controller', () => {
  describe('POST /users', () => {
    const params = userFactory.pick({
      username: true,
      email: true,
      password: true,
    });

    it('should register a new user, save it with hashed password, return a user and a token', async () => {
      const data = params.build();

      const res = await testRequest.post('/users', data);

      const json = res.json();
      expect(json).toMatchObject({
        user: {
          username: data.username,
          email: data.email,
        },
        token: expect.any(String),
      });

      const savedUser = await db.user.findBy({ username: data.username });
      expect(savedUser).toMatchObject({
        username: data.username,
        email: data.email,
      });

      expect(savedUser.password).not.toBe(data.password);

      expect(verifyToken(json.token)).toMatchObject({ id: savedUser.id });

      expect(comparePassword(data.password, savedUser.password));
    });

    it('should return error when username is taken', async () => {
      const data = params.build();
      await userFactory.create({ username: data.username });

      const res = await testRequest.post('/users', data);

      expect(res.json()).toMatchObject({
        error: 'Username is already taken',
      });
    });

    it('should return error when email is taken', async () => {
      const data = params.build();
      await userFactory.create({ email: data.email });

      const res = await testRequest.post('/users', data);

      expect(res.json()).toMatchObject({
        error: 'Email is already taken',
      });
    });
  });
});
