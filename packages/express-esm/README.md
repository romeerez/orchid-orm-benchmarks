# Set up a project with ESM support

ESM support is required by some libraries that don't care about backward compatibility,
and you need to change the project setup to use such libraries.
Otherwise, `commonjs` is fine, it just works, without bundlers and experimental tools.

This is a demo project to show how to do configuration for the ES modules support.

It is a simple `express` server for a todo app.
In the [todos.controller](./src/todos.controller.ts) to-do items being listed, created, updated, and deleted.
[Zod](https://zod.dev/) is used for validations.
[express-async-errors](https://www.npmjs.com/package/express-async-errors) package is included to catch async errors globally in the [error handler](./src/errorHandler.ts).

[p-queue](https://github.com/sindresorhus/p-queue) is [used](./src/queue.controller.ts) as an example of library that doesn't support `commonjs`.

## vite-node

`vite-node` is probably the simplest option that works well with ESM.

Add dependencies:

```json
  "devDependencies": {
    "vite": "4.3.9",
    "vite-node": "0.32.0",
    "vite-plugin-node": "3.0.2"
  }
```

See a [vite config](./vite.config.ts): here we configure a dev server.

Scripts are:

```json
  "scripts": {
    "start": "vite dev",
    "db": "vite-node src/db/dbScript.ts --",
    "build": "vite build",
    "start:prod": "node dist/app.mjs",
    "types": "tsc --noEmit"
  },
```

- `start`: starts a dev server in a watch mode. It supports the HRM (hot module replacement), so the code updates should be available faster than with other approaches.
- `db`: migrations CLI, note the `--` in the end - it's needed to pass arguments from a command line.
- `build`: bundles a server into a single `js` file.
- `start:prod`: to launch the bundled app to make sure everything still works.
- `types`: Vite is using `esbuld` to build TS files very fast, optionally it can use `swc`, and in any case it won't check the types. So we need to run the type checker ourselves.

The following [tsconfig.json](./tsconfig.json) works fine with `vite-node`:

```js
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "skipLibCheck": true,
    // to import express without problems
    "esModuleInterop": true
  }
}
```

We need to export the server instance `app` for a Vite dev server (see [app.ts](./src/app.ts) file):

```ts
// src/app.ts
import express from 'express';

const app = express();

// define routes
app.get('/', (req, res) => res.send('Hello world'));

// if the app was compiled, launch it on the port
if (import.meta.env.PROD) app.listen(3000);

// export the app for the Vite dev server to run in a watch mode
export const viteNodeApp = app;
```

## tsx

[tsx](https://github.com/esbuild-kit/tsx): TypeScript Execute (tsx): Node.js enhanced with esbuild to run TypeScript & ESM files.

It's designed to run TS files, but not to compile them and run them later directly with node.js.
So it's not recommended, as it's problematic to compile TS projects to JS with ESM support to run them in production.

## ts-node

Not recommended: ESM support is experimental, helps running the TS files, but not compiling them.
