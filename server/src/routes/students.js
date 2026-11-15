// Students and progress.
// NOTE: this is a simple sign-in by student number for the prototype.
// Add real authentication (e.g. passwords + JWT, or Supabase Auth) before
// storing anything sensitive.
import { Router } from 'express';

const MODULES = ['intro', 'hash-functions', 'collisions', 'linear-probing', 'searching', 'clustering'];
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

  // PATCH /api/students/:id  { studentNumber }
  // Saves the student number on the account. An empty value clears it.
  router.patch('/:id', async (req, res, next) => {
    try {
      const supplied = req.body?.studentNumber;
      if (supplied !== null && typeof supplied !== 'string') {
        return res.status(400).json({ error: 'Student number must look like u12345678' });
      }
      const studentNumber = supplied?.trim().toLowerCase() || null;
      if (studentNumber && !STUDENT_NUMBER.test(studentNumber)) {
        return res.status(400).json({ error: 'Student number must look like u12345678' });
      }
      const student = await db.student.update({ where: { id: req.params.id }, data: { studentNumber } });
      const { id, email, name, surname } = student;
      res.json({ id, email, name, surname, studentNumber: student.studentNumber });
    } catch (e) {
      if (e?.code === 'P2002') {
        return res.status(409).json({ error: 'That student number is already linked to another account' });
      }
      if (e?.code === 'P2025') return res.status(404).json({ error: 'student not found' });
      next(e);
    }
  });

  // GET /api/students/:id/progress-record
  // The app's whole progress record for this student (null if they have none yet).
  router.get('/:id/progress-record', async (req, res, next) => {
    try {
      const student = await db.student.findUnique({
        where: { id: req.params.id },
        select: { progressData: true },
      });
      if (!student) return res.status(404).json({ error: 'student not found' });
      res.json({ progress: student.progressData ?? null });
    } catch (e) {
      next(e);
    }
  });

  // PUT /api/students/:id/progress-record  { progress }
  // Replaces the student's progress record. The app re-checks the saved quiz
  // answers whenever it loads the record, so only the shape is checked here.
  router.put('/:id/progress-record', async (req, res, next) => {
    try {
      const progress = req.body?.progress;
      const valid = progress && typeof progress === 'object' && !Array.isArray(progress)
        && progress.version === 2 && Array.isArray(progress.completed);
      if (!valid) return res.status(400).json({ error: 'progress must be a version 2 progress record' });
      await db.student.update({ where: { id: req.params.id }, data: { progressData: progress } });
      res.json({ progress });
    } catch (e) {
      if (e?.code === 'P2025') return res.status(404).json({ error: 'student not found' });
      next(e);
    }
  });

  return router;
}