import { db } from './db/db';
import { Request, Response } from 'express';
import { z } from 'zod';
import { TodoTable } from './db/tables/todo.table';

const idParamDto = z.object({ id: z.coerce.number().int() });

const createTodoDto = TodoTable.schema().pick({
  text: true,
  done: true,
});

const updateTodoDto = createTodoDto.partial();

export const todosController = {
  async list(req: Request, res: Response) {
    const todos = await db.todo.order({ createdAt: 'DESC' });
    res.send(todos);
  },

  async get(req: Request, res: Response) {
    const { id } = idParamDto.parse(req.params);
    const todos = await db.todo.find(id);
    res.send(todos);
  },

  async create(req: Request, res: Response) {
    const input = createTodoDto.parse(req.body);
    const todo = await db.todo.create(input);
    res.send(todo);
  },

  async update(req: Request, res: Response) {
    const { id } = idParamDto.parse(req.params);
    const input = updateTodoDto.parse(req.body);
    const todo = await db.todo.selectAll().find(id).update(input);
    res.send(todo);
  },

  async delete(req: Request, res: Response) {
    const { id } = idParamDto.parse(req.params);
    const todo = await db.todo.find(id).selectAll().delete();
    res.send(todo);
  },
};
