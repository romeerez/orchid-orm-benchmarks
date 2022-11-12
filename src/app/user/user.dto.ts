import { z } from 'zod';
import { userSchema } from './user.model';

export const authDto = z.object({
  user: userSchema.pick({
    id: true,
    username: true,
    email: true,
  }),
  token: z.string(),
});
