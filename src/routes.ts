import { FastifyInstance } from 'fastify';
import { helloController } from './app/hello/hello.controller';

export const routes = async (app: FastifyInstance) => {
  app.get('/', helloController);
};
