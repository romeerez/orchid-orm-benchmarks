var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import "express-async-errors";
import express from "express";
import { createBaseTable, orchidORM } from "orchid-orm";
import "dotenv/config";
import { tableToZod } from "orchid-orm-schema-to-zod";
import { z, ZodError } from "zod";
import { NotFoundError } from "pqb";
import PQueue from "p-queue";
const database = {
  databaseURL: process.env.DATABASE_URL
};
if (!database.databaseURL)
  throw new Error("DATABASE_URL is missing in .env");
const config = {
  database
};
const BaseTable = createBaseTable({
  columnTypes: (t) => ({
    ...t,
    text: (min = 0, max = Infinity) => t.text(min, max)
  })
});
class TodoTable extends BaseTable {
  constructor() {
    super(...arguments);
    __publicField(this, "table", "todo");
    __publicField(this, "columns", this.setColumns((t) => ({
      id: t.identity().primaryKey(),
      text: t.text(3, 1e4),
      done: t.boolean().default(false),
      ...t.timestamps()
    })));
  }
}
const TodoDto = tableToZod(TodoTable);
const db = orchidORM(config.database, {
  todo: TodoTable
});
const idParamDto = z.object({ id: z.coerce.number().int() });
const createTodoDto = TodoDto.pick({
  text: true,
  done: true
});
const updateTodoDto = createTodoDto.partial();
const todosController = {
  async list(req, res) {
    const todos = await db.todo.order({ createdAt: "DESC" });
    res.send(todos);
  },
  async get(req, res) {
    const { id } = idParamDto.parse(req.params);
    const todos = await db.todo.find(id);
    res.send(todos);
  },
  async create(req, res) {
    const input = createTodoDto.parse(req.body);
    const todo = await db.todo.create(input);
    res.send(todo);
  },
  async update(req, res) {
    const { id } = idParamDto.parse(req.params);
    const input = updateTodoDto.parse(req.body);
    const todo = await db.todo.selectAll().find(id).update(input);
    res.send(todo);
  },
  async delete(req, res) {
    const { id } = idParamDto.parse(req.params);
    const todo = await db.todo.find(id).selectAll().delete();
    res.send(todo);
  }
};
const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err instanceof NotFoundError) {
    return res.status(400).send({
      error: err.message
    });
  }
  if (err instanceof ZodError) {
    return res.status(400).send(err.errors);
  }
  res.status(500).send("Something went wrong");
};
const queueController = {
  queue(req, res) {
    res.send("Hello world!");
    new PQueue().add(() => console.log("Hello from queue!"));
  }
};
const app = express();
app.use(express.json());
app.get("/", queueController.queue);
app.get("/todos", todosController.list);
app.get("/todos/:id", todosController.get);
app.post("/todos", todosController.create);
app.patch("/todos/:id", todosController.update);
app.delete("/todos/:id", todosController.delete);
app.use(errorHandler);
if (!process.env.VITE_DEV)
  app.listen(3e3);
const viteNodeApp = app;
export {
  viteNodeApp
};
