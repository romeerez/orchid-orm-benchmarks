# Orchid ORM benchmarks

Caution: benchmarks aren't complete! Results are somewhat informative, but inconsistent between runs. Need to investigate this, wrap each ORM into separate Docker instance to make it more fare, because Postgres performs caching and undiscovered internal magic to optimize multiple runs.
---

Comparing queries speed between different ORMs.

[See details and results here](https://orchid-orm.netlify.app/guide/benchmarks.html).

Surprisingly, `Prisma` doesn't support my favorite `pnpm`, so need to use `npm` for installation.

```sh
npm i
```

Change `DATABASE_URL` in the `.env` for correct db credentials, and run the commands:

```sh
npm run db create # create a database
npm run db migrate # create tables
npm run bench simpleSelect # first benchmark
npm run bench nestedSelect # second benchmark
npm run bench simpleInsert # third benchmark
npm run bench nestedInsert # fourth benchmark
```
