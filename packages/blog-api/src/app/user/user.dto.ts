import { z } from 'zod';
import { UserTable } from './user.table';

export const userRegisterDTO = UserTable.schema().pick({
  username: true,
  email: true,
  password: true,
});

export const userLoginDTO = UserTable.schema().pick({
  email: true,
  password: true,
});

export const authDTO = z.object({
  user: UserTable.schema().pick({
    id: true,
    username: true,
    email: true,
  }),
  token: z.string(),
});

export const usernameDTO = UserTable.schema().pick({
  username: true,
});

export const userDTO = UserTable.schema()
  .pick({
    username: true,
  })
  .and(
    z.object({
      following: z.boolean(),
    })
  );
