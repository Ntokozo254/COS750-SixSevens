// Quiz endpoints: check an answer, tag the misconception, save the attempt.
import { Router } from 'express';
import { readFileSync } from 'node:fs';

const questions = JSON.parse(
  readFileSync(new URL('../data/questions.json', import.meta.url), 'utf8'),
);

// `db` is passed in so tests can run without a real database.
export default function quizRouter(db) {
  const router = Router();

  // GET /api/quiz/questions?module=insert  (answers are not sent to the client)
  router.get('/questions', (req, res) => {
    const { module } = req.query;
    const list = questions
      .filter((q) => !module || q.module === module)
      .map(({ options, ...q }) => ({ ...q, options: options.map(({ id, text }) => ({ id, text })) }));
    res.json(list);
  });

  // POST /api/quiz/answer  { studentId, questionId, optionId }
  router.post('/answer', async (req, res, next) => {
    try {
      const { studentId, questionId, optionId } = req.body;
      const question = questions.find((q) => q.id === questionId);
      if (!question) return res.status(404).json({ error: 'unknown question' });
      const option = question.options.find((o) => o.id === optionId);
      if (!option) return res.status(400).json({ error: 'unknown option' });

      const correct = option.correct === true;
      const misconception = correct ? null : option.misconception ?? null;

      if (studentId) {
        await db.quizAttempt.create({
          data: { studentId, questionId, optionId, correct, misconception, module: question.module },
        });
      }
      res.json({ correct, misconception });
    } catch (e) {
      next(e);
    }
  });

  return router;
}