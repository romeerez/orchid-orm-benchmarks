import { app } from '../../app';
import { InjectOptions } from 'fastify';

const request = app.inject.bind(app);

const requestWithPayload = (method: InjectOptions['method']) => {
  return function (
    this: typeof request,
    url: string,
    payload?: InjectOptions['payload'],
    params?: Omit<InjectOptions, 'method' | 'url' | 'payload'>
  ) {
    return this({
      ...params,
      url,
      method,
      payload,
    });
  };
};

export const testRequest = Object.assign(request, {
  get(
    this: typeof request,
    url: string,
    params?: Omit<InjectOptions, 'method' | 'url'>
  ) {
    return this({ ...params, url, method: 'get' });
  },
  post: requestWithPayload('post'),
  patch: requestWithPayload('patch'),
  put: requestWithPayload('put'),
  delete: requestWithPayload('delete'),
});
