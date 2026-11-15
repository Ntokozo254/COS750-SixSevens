# COS212 App – Backend

Node.js + Express API for the hash tables and linear probing app. Data is stored
in a PostgreSQL database on Neon, through Prisma. Endpoints are in [API.MD](./API.MD).

For running both the frontend and backend, follow the [local running guide](../docs/running-locally.md).

## Setup

1. Install Node.js 20.19+ or 22.12+ and npm.
2. Open a terminal in the `server` folder and install packages:
   ```
   npm ci
   ```
3. Get the `.env` file from the group chat and put it in the `server` folder.
   It is not in GitHub because it holds the database password.
4. Start the API:
   ```
   npm run dev
   ```
   It runs on http://localhost:3000. Check http://localhost:3000/api/health.
   The first request after a while can be slow, because the free Neon database
   sleeps when it isn't used.

For a new database or after pulling schema changes, run `npx prisma migrate status`.
Apply pending checked-in migrations with `npx prisma migrate deploy`, then run
`npx prisma generate`. The current login requires the auth and surname migrations.
An already current database needs no migration. Use `npm run db:migrate` when
developing a new schema change, rather than for ordinary startup.

The server reads `server/.env` by default. Configure `DATABASE_URL`, optionally
`PORT=3000`, and `CORS_ORIGIN=http://localhost:5173` for the frontend's local URL.
The normal command does not load `.env.local` automatically.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | start the API, restart on changes |
| `npm test` | run the tests (no database needed) |
| `npm run db:studio` | open Prisma Studio to see the data |
| `npm run db:migrate` | apply schema changes to the database |

## Modules

The backend uses the same 6 modules as the front end: `intro`, `hash-functions`,
`collisions`, `linear-probing`, `searching`, `clustering`. To change them, edit
`MODULES` in `src/routes/students.js` and the questions in `src/data/questions.json`.

## Layout

```
src/
  index.js             starts the server
  app.js               builds the Express app
  db.js                Prisma client
  validation.js        input checks
  logic/hashTable.js   insert, search, update, delete (tombstones) with steps
  routes/table.js      /api/table/*    (no database)
  routes/quiz.js       /api/quiz/*     (saves attempts)
  routes/students.js   /api/students/* (sign-in and progress)
  routes/auth.js       /api/auth/*     (email/password accounts)
  data/questions.json  quiz questions with misconception tags
prisma/schema.prisma   Student, Progress, QuizAttempt tables
tests/                 hash table and API tests
```

## Database tables

- **Student**: optional unique `studentNumber`/`email`, password hash, name, and surname
- **Progress**: one row per student per module, with `completed` and `score`
- **QuizAttempt**: one row per answer, with `correct` and `misconception`
