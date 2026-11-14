# COS212 App – Backend

Node.js + Express API for the hash tables and linear probing app. Data is stored
in a PostgreSQL database on Neon, through Prisma. Endpoints are in [API.MD](./API.MD).

## Setup

1. Install Node.js 20 or newer from https://nodejs.org.
2. Open a terminal in the `server` folder and install packages:
   ```
   npm install
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

The database tables already exist on Neon, so you don't need to migrate.
Only run `npm run db:migrate` after changing `prisma/schema.prisma`.

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
  data/questions.json  quiz questions with misconception tags
prisma/schema.prisma   Student, Progress, QuizAttempt tables
tests/                 hash table and API tests
```

## Database tables

- **Student**: `studentNumber` (unique) and `name`
- **Progress**: one row per student per module, with `completed` and `score`
- **QuizAttempt**: one row per answer, with `correct` and `misconception`