# Blog API

This is a demo API built for `Porm` [tutorial](https://porm.netlify.app/guide/building-a-sample-app.html).

Setup and run:

Add a `.env.local` file to override `DATABASE_URL` and `DATABASE_URL_TEST` vars for access to your Postgres database.

The project is using `pnpm`, however, `npm` and `yarn` should work just fine either.

```sh
pnpm i
pnpm run db create # create db
pnpm run db migrate # migrate db
pnpm test # run tests
pnpm start # start in dev mode
```
