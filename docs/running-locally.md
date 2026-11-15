# Run HashLab locally with the backend

The software has two processes: the React/Vite frontend in `app/`, and the Express/Prisma backend in `server/`. The backend connects to PostgreSQL using the database URL in `server/.env`.

## 1. Open the project

Use Node.js 20.19+ or 22.12+ and npm. This checkout was verified with Node.js 26.4.0 and npm 12.0.1.

On this computer:

```bash
cd "/Users/resegomorei/Documents/University of Pretoria/COS 750/2026/COS750-SixSevens"
```

Run the following commands from that project folder. Open a second terminal in the same folder when starting the frontend.

## 2. Install dependencies once

Skip this step when both folders already have current dependencies installed.

```bash
npm --prefix server ci
npm --prefix app ci
```

The backend installation generates the Prisma client. Installing packages at the repository root does not install either application's dependencies. Repeat these commands after dependency lockfiles change.

## 3. Configure the backend database

Keep the existing `server/.env` in this checkout. For a new checkout, obtain the group's database credentials and create `server/.env`. Its settings have this shape; replace the example connection string with the actual PostgreSQL URL:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

The database can be the group's Neon PostgreSQL instance or a separately configured PostgreSQL database. A local database must exist and be running before migrations or authentication can work. Do not commit the credentials. The server loads `.env` by default; a file named `.env.local` alone is not loaded by its normal startup command.

For a newly configured database, or after pulling changes to the database schema, check migration status from `server/`:

```bash
cd server
npx prisma migrate status
```

If the status reports pending checked-in migrations, apply them and regenerate the client:

```bash
npx prisma migrate deploy
npx prisma generate
```

Return to the project folder afterwards:

```bash
cd ..
```

The migrations include the email/password and surname columns needed by the current login form. An already current database needs no migration. The existing configured database was reachable and had these authentication columns when checked on 14 November 2026.

## 4. Start the backend — terminal 1

From the project folder:

```bash
npm --prefix server run dev
```

Expected startup message:

```text
COS212 API running on http://localhost:3000
```

Keep this terminal open. Visit [http://localhost:3000/api/health](http://localhost:3000/api/health); it should return `{"ok":true}`. This checks the HTTP server. Signing in or registering also uses the database. A sleeping Neon instance may make the first database request slower.

## 5. Start the frontend — terminal 2

From the project folder:

```bash
npm --prefix app run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Keep this terminal open, then visit **[http://localhost:5173/](http://localhost:5173/)**. Use `localhost` in the browser: `http://127.0.0.1:5173` is a different browser origin and does not match the current backend's `CORS_ORIGIN`.

The frontend defaults to calling `http://localhost:3000`. No frontend environment file is needed for these commands. If the backend's address changes, set `VITE_API_URL` in `app/.env.local` and restart Vite, for example:

```dotenv
VITE_API_URL="http://localhost:3000"
```

Sign in with an existing account, or choose **Create an account** and enter your name, surname, email, and a password of at least eight characters. Account details are stored in PostgreSQL. Lesson completion, checked assessment evidence, and settings currently remain in this browser's local storage.

## 6. Stop or troubleshoot

- **Stop:** press `Ctrl+C` in each service's terminal.
- **Port already in use:** an instance may already be running. Try the URLs above first. Stop the earlier instance in its terminal before starting another one. `--strictPort` keeps the frontend from silently switching to an address that differs from the configured CORS origin.
- **Login cannot reach the backend:** check the backend terminal and health URL, then confirm the browser is using `http://localhost:5173/` and the frontend API address is `http://localhost:3000`.
- **Health works but login fails with a server error:** check `DATABASE_URL`, database reachability, and pending migrations. A successful health check alone does not verify PostgreSQL.
- **Blank page:** hard-reload with `Cmd+Shift+R` on Mac or `Ctrl+Shift+R` on Windows/Linux. If it persists, stop only the frontend and restart it with the command above plus `--force` to rebuild Vite's dependency cache.
- **Prisma client missing or stale:** run `npx prisma generate` from `server/`, then restart the backend.

## Verification commands

From the project folder:

```bash
npm --prefix server test
```

The backend's 33 tests pass and use a test database substitute; they do not need the real PostgreSQL database. The configured database connection, authentication columns, running login endpoint, frontend HTTP entry, and matching browser CORS origin were separately checked on 14 November 2026.

For frontend regression tests and a production build:

```bash
cd app
node --test src/logic/*.test.js src/features/*/*.test.js
npm run build
```
