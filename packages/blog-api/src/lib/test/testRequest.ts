import { app } from '../../app';
import { InjectOptions } from 'fastify';
import { createToken } from '../jwt';

const request = app.inject.bind(app);

const requestWithPayload = (method: InjectOptions['method']) => {
  return function (
    this: typeof request,
    url: string,
    payload?: InjectOptions['payload'],
    params?: Omit<InjectOptions, 'method' | 'url' | 'payload'>
  ) {
    const chain = typeof this === 'function' ? this() : this;
    Object.assign(
      (chain as unknown as Record<string, Record<string, unknown>>).option,
      {
        url,
        method,
        payload,
        ...params,
      }
    );
    return chain.end();
  };
};

const makeTestRequest = (req: typeof request) => {
  return Object.assign(req, {
    as<T extends typeof request>(this: T, user: { id: number }): T {
      return makeTestRequest(
        this().headers({
          authorization: `Bearer ${createToken(user)}`,
        }) as unknown as typeof request
      ) as unknown as T;
    },
    get(
      this: typeof request,
      url: string,
      params?: Omit<InjectOptions, 'method' | 'url'>
    ) {
      const chain = typeof this === 'function' ? this() : this;
      Object.assign(
        (chain as unknown as Record<string, Record<string, unknown>>).option,
        {
          url,
          method: 'get',
          ...params,
        }
      );
      return chain.end();
    },
    post: requestWithPayload('post'),
    patch: requestWithPayload('patch'),
    put: requestWithPayload('put'),
    delete: requestWithPayload('delete'),
  });
};

export const testRequest = makeTestRequest(request);
