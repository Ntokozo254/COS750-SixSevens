// Builds the Express app. Kept separate from index.js so tests can use it
// without starting a server or connecting to a real database.
import express from 'express';
import cors from 'cors';
import tableRouter from './routes/table.js';
import quizRouter from './routes/quiz.js';
import studentsRouter from './routes/students.js';
import authRouter from './routes/auth.js';

export function createApp({ db, corsOrigin = '*' } = {}) {
  const app = express();
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/table', tableRouter);
  app.use('/api/quiz', quizRouter(db));
  app.use('/api/students', studentsRouter(db));
  app.use('/api/auth', authRouter(db));

  app.use((req, res) => res.status(404).json({ error: 'not found' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'something went wrong' });
  });
  return app;
}