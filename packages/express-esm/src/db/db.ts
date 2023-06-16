import { orchidORM } from 'orchid-orm';
import { config } from './config';
import { TodoTable } from './tables/todo.table';

export const db = orchidORM(config.database, {
  todo: TodoTable,
});
