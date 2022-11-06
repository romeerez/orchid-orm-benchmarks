import { routeHandler } from '../../lib/routeHandler';
import { z } from 'zod';
import { db } from '../../db';
import { encryptPassword } from '../../lib/password';
import { createToken } from '../../lib/jwt';
import { userSchema } from './user.model';
import { ApiError } from '../../lib/errors';
import { comparePassword } from '../../lib/password';
import { omit } from '../../lib/utils';

export const registerUserRoute = routeHandler(
  {
    body: userSchema.pick({
      username: true,
      email: true,
      password: true,
    }),
    result: {
      user: userSchema.pick({
        id: true,
        username: true,
        email: true,
      }),
      token: z.string(),
    },
  },
  async (req) => {
    try {
      const user = await db.user.select('id', 'email', 'username').create({
        ...req.body,
        password: await encryptPassword(req.body.password),
      });

      return {
        user,
        token: createToken({ id: user.id }),
      };
    } catch (err) {
      if (err instanceof db.user.error && err.isUnique) {
        if (err.columns.username) {
          throw new ApiError('Username is already taken');
        }
        if (err.columns.email) {
          throw new ApiError('Email is already taken');
        }
      }
      throw err;
    }
  }
);

export const loginUser = routeHandler(
  {
    body: userSchema.pick({
      email: true,
      password: true,
    }),
    result: {
      user: userSchema.pick({
        id: true,
        username: true,
        email: true,
      }),
      token: z.string(),
    },
  },
  async (req) => {
    const user = await db.user
      .select('id', 'email', 'username', 'password')
      .findByOptional({
        email: req.body.email,
      });

    if (!user || !(await comparePassword(req.body.password, user.password))) {
      throw new ApiError('Email or password is invalid');
    }

    return {
      user: omit(user, 'password'),
      token: createToken({ id: user.id }),
    };
  }
);
