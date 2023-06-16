import { Request, Response } from 'express';
import PQueue from 'p-queue';

export const queueController = {
  queue(req: Request, res: Response) {
    res.send('Hello world!');

    new PQueue().add(() => console.log('Hello from queue!'));
  },
};
