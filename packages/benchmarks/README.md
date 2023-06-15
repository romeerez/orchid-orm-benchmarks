# Orchid ORM benchmarks

Comparing queries speed between different ORMs.

[See details and results here](https://orchid-orm.netlify.app/guide/benchmarks.html).

## To run locally

Change `DATABASE_URL` in the `.env` for correct db credentials.

Prisma will use `DATABASE_URL` as is, other ORMs will append their name to the db name.
Each ORM is using a separate database to ensure that nothing is cached on a database level between different ORMs.

```sh
# install deps
pnpm i
# create all databases
pnpm db create 
# create tables in all databases
pnpm db migrate

# generate Prisma client
pnpm prisma generate

# run benchmarks
pnpm bench simpleSelect
pnpm bench nestedSelect
pnpm bench simpleInsert
pnpm bench nestedInsert
```
