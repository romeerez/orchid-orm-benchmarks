// patch express to catch async errors
import 'express-async-errors';
import express from 'express';
import { todosController as todos } from './todos.controller';
import { errorHandler } from './errorHandler';
import { queueController } from './queue.controller';

// setup express
const app = express();
app.use(express.json());

// define routes
app.get('/', queueController.queue);
app.get('/todos', todos.list);
app.get('/todos/:id', todos.get);
app.post('/todos', todos.create);
app.patch('/todos/:id', todos.update);
app.delete('/todos/:id', todos.delete);

// register global error handler
app.use(errorHandler);

// If the app was compiled, launch it on the port
if (import.meta.env.PROD) app.listen(3000);

// export the app for the Vite dev server to run in a watch mode
export const viteNodeApp = app;
