import fastify from 'fastify';
import { config } from './config';
import { routes } from './routes';
import { ZodError } from 'zod';
import { ApiError } from './lib/errors';

export const app = fastify({ logger: config.logger });

app.register(routes);

app.setErrorHandler(function (error, request, reply) {
  // Log error
  this.log.error(error);

  if (error instanceof ZodError) {
    reply.status(422).send({
      error: 'Validation failed',
      issues: error.issues,
    });
  } else if (error instanceof ApiError) {
    reply.status(error.statusCode).send({
      error: error.message,
    });
  } else {
    reply.status(500).send({
      error: 'Something went wrong',
    });
  }
});
