import { testRequest } from '../../lib/test/testRequest';
import { factory } from '../../lib/test/testFactories';
import { db } from '../../db';
import { verifyToken } from '../../lib/jwt';
import { comparePassword, encryptPassword } from '../../lib/password';

describe('user controller', () => {
  describe('POST /users', () => {
    const params = factory.user.pick({
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
      await factory.user.create({ username: data.username });

      const res = await testRequest.post('/users', data);

      expect(res.json()).toMatchObject({
        message: 'Username is already taken',
      });
    });

    it('should return error when email is taken', async () => {
      const data = params.build();
      await factory.user.create({ email: data.email });

      const res = await testRequest.post('/users', data);

      expect(res.json()).toMatchObject({
        message: 'Email is already taken',
      });
    });
  });

  describe('POST /users/auth', () => {
    it('should authorize user, return user object and auth token', async () => {
      const password = 'password';
      const user = await factory.user.create({
        password: await encryptPassword(password),
      });

      const res = await testRequest.post('/users/auth', {
        email: user.email,
        password,
      });

      const json = res.json();
      expect(json).toMatchObject({
        user: {
          username: user.username,
          email: user.email,
        },
        token: expect.any(String),
      });

      expect(verifyToken(json.token)).toMatchObject({ id: user.id });
    });

    it('should return error when email is not registered', async () => {
      const res = await testRequest.post('/users/auth', {
        email: 'not-registered@test.com',
        password: 'password',
      });

      expect(res.json()).toMatchObject({
        message: 'Email or password is invalid',
      });
    });

    it('should return error when password is invalid', async () => {
      const user = await factory.user.create();

      const res = await testRequest.post('/users/auth', {
        email: user.email,
        password: 'invalid password',
      });

      expect(res.json()).toMatchObject({
        message: 'Email or password is invalid',
      });
    });
  });

  describe('POST /users/:username/follow', () => {
    it('should follow a user', async () => {
      const currentUser = await factory.user.create();
      const userToFollow = await factory.user.create();

      await testRequest
        .as(currentUser)
        .post(`/users/${userToFollow.username}/follow`);

      const follows = await db.userFollow.where({
        followingId: userToFollow.id,
      });
      expect(follows).toEqual([
        {
          followerId: currentUser.id,
          followingId: userToFollow.id,
        },
      ]);
    });

    it('should return not found error when no user found by username', async () => {
      const currentUser = await factory.user.create();

      const res = await testRequest
        .as(currentUser)
        .post(`/users/lalala/follow`);

      expect(res.json()).toEqual({
        message: 'Record is not found',
      });
    });
  });

  describe('DELETE /users/:username/follow', () => {
    it('should unfollow a user', async () => {
      const currentUser = await factory.user.create();
      const userToFollow = await factory.user.create({
        follows: { create: [{ followerId: currentUser.id }] },
      });

      await testRequest
        .as(currentUser)
        .delete(`/users/${userToFollow.username}/follow`);

      const exists = await db.userFollow
        .where({
          followingId: userToFollow.id,
        })
        .exists();
      expect(exists).toEqual(false);
    });

    it('should return not found error when no user found by username', async () => {
      const currentUser = await factory.user.create();

      const res = await testRequest
        .as(currentUser)
        .post(`/users/lalala/follow`);

      expect(res.json()).toEqual({
        message: 'Record is not found',
      });
    });
  });
});
