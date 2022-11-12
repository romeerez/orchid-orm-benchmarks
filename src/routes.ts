import { FastifyInstance } from 'fastify';
import { helloController } from './app/hello/hello.controller';
import * as user from './app/user/user.controller';
import * as article from './app/article/article.controller';

export const routes = async (app: FastifyInstance) => {
  app.get('/', helloController);

  app.post('/users', user.registerUserRoute);
  app.post('/users/auth', user.loginUserRoute);
  app.post('/users/:username/follow', user.followUserRoute);
  app.delete('/users/:username/follow', user.unfollowUserRoute);

  app.get('/articles', article.listArticlesRoute);
};
