import { FastifyReply, FastifyRequest } from 'fastify';
import {
  AnyZodObject,
  z,
  ZodObject,
  ZodRawShape,
  ZodType,
  ZodTypeAny,
} from 'zod';
import { config } from '../config';
import { deepStrict } from './zodUtils';

export const routeHandler = <
  Params extends AnyZodObject,
  Query extends AnyZodObject,
  Body extends AnyZodObject,
  Result extends ZodTypeAny | ZodRawShape,
  Request = Omit<FastifyRequest, 'params' | 'query' | 'body'> & {
    params: z.infer<Params>;
    query: z.infer<Query>;
    body: z.infer<Body>;
  },
  Response = Result extends AnyZodObject
    ? z.infer<Result>
    : Result extends ZodRawShape
    ? z.infer<ZodObject<Result>>
    : never
>(
  schema: {
    params?: Params;
    query?: Query;
    body?: Body;
    result?: Result;
  },
  fn: (req: Request, res: FastifyReply) => Promise<Response> | Response
): ((req: FastifyRequest, res: FastifyReply) => Promise<Response>) => {
  const params = schema.params;
  const query = schema.query;
  const body = schema.body;
  const result =
    schema.result &&
    config.validateResponses &&
    deepStrict(
      Object.getPrototypeOf(schema.result)?.constructor !== Object
        ? (schema.result as ZodTypeAny)
        : z.object(schema.result as ZodRawShape)
    );

  return async (req, res) => {
    if (params) req.params = params.parse(req.params);
    if (query) req.query = query.parse(req.query);
    if (body) req.body = body.parse(req.body);

    const response = await fn(req as Request, res);

    if (result) {
      return result.parse(response);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response as any;
  };
};
