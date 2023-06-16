import { ErrorRequestHandler } from 'express';
import { NotFoundError } from 'pqb';
import { ZodError } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof NotFoundError) {
    return res.status(400).send({
      error: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).send(err.errors);
  }

  res.status(500).send('Something went wrong');
};
