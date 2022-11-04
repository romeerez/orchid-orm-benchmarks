import { FastifyReply, FastifyRequest } from 'fastify';
import { z, ZodObject, ZodRawShape } from 'zod';
import { config } from '../config';

export const requestHandler = <
  Params extends ZodRawShape,
  Query extends ZodRawShape,
  Body extends ZodRawShape,
  Result extends ZodRawShape,
  Request = Omit<FastifyRequest, 'params' | 'query' | 'body'> & {
    params: ZodRawShape extends Params ? never : z.infer<ZodObject<Params>>;
    query: ZodRawShape extends Query ? never : z.infer<ZodObject<Query>>;
    body: ZodRawShape extends Body ? never : z.infer<ZodObject<Body>>;
  }
>(
  schema: {
    params?: Params;
    query?: Query;
    body?: Body;
    result?: Result;
  },
  fn: (req: Request, res: FastifyReply) => z.infer<ZodObject<Result>>
): ((
  req: FastifyRequest,
  res: FastifyReply
) => Promise<z.infer<ZodObject<Result>>>) => {
  const params = schema.params && z.object(schema.params);
  const query = schema.query && z.object(schema.query);
  const body = schema.body && z.object(schema.body);
  const result =
    schema.result &&
    config.validateResponses &&
    z.object(schema.result).strict();

  return async (req, res) => {
    if (params) req.params = params.parse(req.params);
    if (query) req.query = query.parse(req.query);
    if (body) req.body = body.parse(req.body);

    if (result) {
      return result.parse(await fn(req as Request, res));
    }

    return fn(req as Request, res);
  };
};
