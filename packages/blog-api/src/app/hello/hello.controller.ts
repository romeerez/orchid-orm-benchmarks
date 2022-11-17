import { routeHandler } from '../../lib/routeHandler';
import { z } from 'zod';

export const helloController = routeHandler(
  {
    result: {
      hello: z.string(),
    },
  },
  () => {
    return { hello: 'world' };
  }
);
