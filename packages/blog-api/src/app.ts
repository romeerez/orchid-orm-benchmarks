import fastify from 'fastify';
import { config } from './config';
import { routes } from './routes';
import { ZodError } from 'zod';
import { ApiError } from './lib/errors';
import { NotFoundError } from 'pqb';

export const app = fastify({ logger: config.logger });

app.register(routes);

app.setErrorHandler(function (error, request, res) {
  this.log.error(error);

  if (error instanceof NotFoundError) {
    res.status(404).send({
      message: 'Record is not found',
    });
  } else if (error instanceof ZodError) {
    res.status(422).send({
      message: 'Validation failed',
      issues: error.issues,
    });
  } else if (error instanceof ApiError) {
    res.status(error.statusCode).send({
      message: error.message,
    });
  } else {
    res.status(500).send({
      message: 'Something went wrong',
    });
  }
});
