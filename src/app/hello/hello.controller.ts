import { requestHandler } from '../../lib/requestHandler';
import { z } from 'zod';

export const helloController = requestHandler(
  {
    result: {
      hello: z.string(),
    },
  },
  () => {
    return { hello: 'world' };
  }
);
