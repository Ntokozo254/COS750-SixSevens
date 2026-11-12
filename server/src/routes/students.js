// Students and progress.
// NOTE: this is a simple sign-in by student number for the prototype.
// Add real authentication (e.g. passwords + JWT, or Supabase Auth) before
// storing anything sensitive.
import { Router } from 'express';

const MODULES = ['basics', 'insert', 'search', 'update', 'delete'];
const STUDENT_NUMBER = /^u?\d{8}$/i; // e.g. u21234567

export default function studentsRouter(db) {
  const router = Router();

  // POST /api/students/signin  { studentNumber, name }
  router.post('/signin', async (req, res, next) => {
    try {
      const { studentNumber, name } = req.body;
      if (!STUDENT_NUMBER.test(studentNumber ?? '')) {
        return res.status(400).json({ error: 'studentNumber must look like u12345678' });
      }
      const student = await db.student.upsert({
        where: { studentNumber: studentNumber.toLowerCase() },
        update: {},
        create: { studentNumber: studentNumber.toLowerCase(), name: name ?? null },
      });
      res.json(student);
    } catch (e) {
      next(e);
    }
  });

  // GET /api/students/:id/progress
  router.get('/:id/progress', async (req, res, next) => {
    try {
      const rows = await db.progress.findMany({ where: { studentId: req.params.id } });
      res.json(MODULES.map((module) => {
        const row = rows.find((r) => r.module === module);
        return { module, completed: row?.completed ?? false, score: row?.score ?? null };
      }));
    } catch (e) {
      next(e);
    }
  });

  // POST /api/students/:id/progress  { module, completed, score }
  router.post('/:id/progress', async (req, res, next) => {
    try {
      const { module, completed = true, score = null } = req.body;
      if (!MODULES.includes(module)) {
        return res.status(400).json({ error: `module must be one of ${MODULES.join(', ')}` });
      }
      const row = await db.progress.upsert({
        where: { studentId_module: { studentId: req.params.id, module } },
        update: { completed, score },
        create: { studentId: req.params.id, module, completed, score },
      });
      res.json(row);
    } catch (e) {
      next(e);
    }
  });

  return router;
}