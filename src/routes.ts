import { FastifyInstance } from 'fastify';
import { helloController } from './app/hello/hello.controller';
import * as userController from './app/user/user.controller';

export const routes = async (app: FastifyInstance) => {
  app.get('/', helloController);
  app.post('/users', userController.registerUserRoute);
  app.post('/users/auth', userController.loginUserRoute);
  app.post('/users/:username/follow', userController.followUserRoute);
  app.delete('/users/:username/follow', userController.unfollowUserRoute);
};
