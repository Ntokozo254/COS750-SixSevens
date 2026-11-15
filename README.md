# COS750-SixSevens
This is for the COS 750 final project

## Run the software with the backend

From the project folder, use two terminals and keep both running.

Terminal 1 — backend:

```bash
npm --prefix server run dev
```

Terminal 2 — frontend:

```bash
npm --prefix app run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open **[http://localhost:5173/](http://localhost:5173/)**, then sign in or create an account. The backend runs at [http://localhost:3000](http://localhost:3000); its health check is [http://localhost:3000/api/health](http://localhost:3000/api/health).

For first-time dependency installation, database configuration, and troubleshooting, follow the [local running guide](docs/running-locally.md). Use `localhost` in the browser to match the configured backend CORS origin. Press `Ctrl+C` in each terminal to stop the services.

## Documentation

- [Practice Lab coding path](docs/practice-lab-instructional-design.md): staged JavaScript problems, guided insertion, feedback, sandbox, and learning-design rationale.
- [Run locally with the backend](docs/running-locally.md): installation, environment variables, database setup, startup, and troubleshooting.
- [Software styling guide](docs/software-styling.md): design tokens, component styles, interaction states, and responsive layouts.
