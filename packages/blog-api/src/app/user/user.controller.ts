import { routeHandler } from '../../lib/routeHandler';
import { db } from '../../db';
import { encryptPassword } from '../../lib/password';
import { createToken } from '../../lib/jwt';
import { ApiError } from '../../lib/errors';
import { comparePassword } from '../../lib/password';
import { omit } from '../../lib/utils';
import { getCurrentUserId } from './user.service';
import {
  authDTO,
  userLoginDTO,
  usernameDTO,
  userRegisterDTO,
} from './user.dto';

export const registerUserRoute = routeHandler(
  {
    body: userRegisterDTO,
    result: authDTO,
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

export const loginUserRoute = routeHandler(
  {
    body: userLoginDTO,
    result: authDTO,
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

export const followUserRoute = routeHandler(
  {
    params: usernameDTO,
  },
  async (req) => {
    const userId = getCurrentUserId(req);

    await db.user
      .findBy({
        username: req.params.username,
      })
      .follows.create({
        followerId: userId,
      });
  }
);

export const unfollowUserRoute = routeHandler(
  {
    params: usernameDTO,
  },
  async (req) => {
    const userId = getCurrentUserId(req);

    await db.user
      .findBy({
        username: req.params.username,
      })
      .follows.findBy({
        followerId: userId,
      })
      .delete();
  }
);
