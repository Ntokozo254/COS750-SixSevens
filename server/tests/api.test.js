import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

// A fake database so the API tests run without PostgreSQL.
const fakeDb = () => ({
  quizAttempt: { create: vi.fn(async ({ data }) => data) },
  student: { upsert: vi.fn(async ({ create }) => ({ id: 'student-1', ...create })) },
  progress: {
    findMany: vi.fn(async () => [{ module: 'hash-functions', completed: true, score: 3 }]),
    upsert: vi.fn(async ({ create }) => create),
  },
});

describe('table API', () => {
  const app = createApp({ db: fakeDb() });

  it('inserts keys and returns the table and steps', async () => {
    const res = await request(app).post('/api/table/insert').send({ keys: [23, 43], size: 10 });
    expect(res.status).toBe(200);
    expect(res.body.table.slots[4]).toEqual({ key: 43, value: null });
    expect(res.body.results[1].steps.length).toBeGreaterThan(0);
  });

  it('searches a table sent by the client', async () => {
    const built = await request(app).post('/api/table/insert').send({ keys: [23, 43, 13] });
    const res = await request(app).post('/api/table/search').send({ table: built.body.table, key: 13 });
    expect(res.body).toMatchObject({ found: true, slot: 5, checks: 3 });
  });

  it('deletes with a tombstone and keeps later keys reachable', async () => {
    const built = await request(app).post('/api/table/insert').send({ keys: [23, 43, 13] });
    const del = await request(app).post('/api/table/delete').send({ table: built.body.table, key: 43 });
    const res = await request(app).post('/api/table/search').send({ table: del.body.table, key: 13 });
    expect(res.body.found).toBe(true);
  });

  it.each([
    [{ keys: [-5] }],
    [{ keys: ['abc'] }],
    [{ keys: [] }],
    [{ keys: [1], size: 0 }],
  ])('rejects bad input %j', async (body) => {
    const res = await request(app).post('/api/table/insert').send(body);
    expect(res.status).toBe(400);
  });
});

describe('quiz API', () => {
  it('tags the misconception for a wrong answer and saves the attempt', async () => {
    const db = fakeDb();
    const app = createApp({ db });
    const res = await request(app).post('/api/quiz/answer')
      .send({ studentId: 'student-1', questionId: 'q-searching-1', optionId: 'a' });
    expect(res.body.correct).toBe(false);
    expect(res.body.misconception).toBe('stopAtOccupied');
    expect(res.body.explanation).toContain('empty slot');
    expect(db.quizAttempt.create).toHaveBeenCalledOnce();
  });

  it('does not send the answers or explanations with the questions', async () => {
    const res = await request(createApp({ db: fakeDb() })).get('/api/quiz/questions?module=linear-probing');
    expect(res.body).toHaveLength(1);
    expect(res.body[0].options[0]).not.toHaveProperty('correct');
    expect(res.body[0]).not.toHaveProperty('explanation');
  });
});

describe('students API', () => {
  it('signs in by student number', async () => {
    const res = await request(createApp({ db: fakeDb() }))
      .post('/api/students/signin').send({ studentNumber: 'u21234567', name: 'Kea' });
    expect(res.body.studentNumber).toBe('u21234567');
  });

  it('returns progress for every module', async () => {
    const res = await request(createApp({ db: fakeDb() })).get('/api/students/student-1/progress');
    expect(res.body).toHaveLength(6);
    expect(res.body[1]).toEqual({ module: 'hash-functions', completed: true, score: 3 });
  });
});
describe('progress record API', () => {
  // One student whose progress record is kept in memory.
  const recordDb = () => {
    const student = { id: 'student-1', progressData: null };
    return {
      student: {
        findUnique: vi.fn(async ({ where }) => (where.id === student.id ? student : null)),
        update: vi.fn(async ({ where, data }) => {
          if (where.id !== student.id) throw Object.assign(new Error('missing'), { code: 'P2025' });
          return Object.assign(student, data);
        }),
      },
    };
  };
  const record = { version: 2, completed: [1], searchAssessment: null };

  it('starts empty, then returns what was saved', async () => {
    const app = createApp({ db: recordDb() });
    const empty = await request(app).get('/api/students/student-1/progress-record');
    expect(empty.body).toEqual({ progress: null });

    const saved = await request(app).put('/api/students/student-1/progress-record').send({ progress: record });
    expect(saved.status).toBe(200);
    const loaded = await request(app).get('/api/students/student-1/progress-record');
    expect(loaded.body).toEqual({ progress: record });
  });

  it('keeps each student separate', async () => {
    const app = createApp({ db: recordDb() });
    const res = await request(app).get('/api/students/someone-else/progress-record');
    expect(res.status).toBe(404);
    const put = await request(app).put('/api/students/someone-else/progress-record').send({ progress: record });
    expect(put.status).toBe(404);
  });

  it.each([[{}], [{ progress: [1, 2] }], [{ progress: { version: 1, completed: [] } }]])(
    'rejects a body that is not a progress record: %j',
    async (body) => {
      const res = await request(createApp({ db: recordDb() }))
        .put('/api/students/student-1/progress-record').send(body);
      expect(res.status).toBe(400);
    },
  );
});

describe('student number API', () => {
  // Two accounts; student numbers are unique, as in the database.
  const profileDb = () => {
    const rows = [
      { id: 'student-1', email: 'a@example.com', name: 'A', surname: 'One', studentNumber: null, passwordHash: 'x' },
      { id: 'student-2', email: 'b@example.com', name: 'B', surname: 'Two', studentNumber: 'u22222222', passwordHash: 'x' },
    ];
    return {
      student: {
        update: vi.fn(async ({ where, data }) => {
          const row = rows.find((r) => r.id === where.id);
          if (!row) throw Object.assign(new Error('missing'), { code: 'P2025' });
          if (data.studentNumber && rows.some((r) => r !== row && r.studentNumber === data.studentNumber)) {
            throw Object.assign(new Error('taken'), { code: 'P2002' });
          }
          return Object.assign(row, data);
        }),
      },
    };
  };

  it('saves a student number on the account, without the password hash', async () => {
    const res = await request(createApp({ db: profileDb() }))
      .patch('/api/students/student-1').send({ studentNumber: ' U12345678 ' });
    expect(res.status).toBe(200);
    expect(res.body.studentNumber).toBe('u12345678');
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('clears the student number when it is left empty', async () => {
    const res = await request(createApp({ db: profileDb() }))
      .patch('/api/students/student-2').send({ studentNumber: '' });
    expect(res.body.studentNumber).toBeNull();
  });

  it('rejects a badly formed number and one used by another account', async () => {
    const app = createApp({ db: profileDb() });
    const bad = await request(app).patch('/api/students/student-1').send({ studentNumber: 'abc' });
    expect(bad.status).toBe(400);
    const taken = await request(app).patch('/api/students/student-1').send({ studentNumber: 'u22222222' });
    expect(taken.status).toBe(409);
  });
});

describe('auth API', () => {
  const person = { name: 'Test', surname: 'User' };
  // A tiny in-memory student table.
  const memoryDb = () => {
    const rows = [];
    return {
      student: {
        findUnique: vi.fn(async ({ where }) => rows.find((r) => r.email === where.email) ?? null),
        create: vi.fn(async ({ data }) => {
          const row = { id: `student-${rows.length + 1}`, studentNumber: null, ...data };
          rows.push(row);
          return row;
        }),
      },
    };
  };

  it('registers, then logs in with the same password', async () => {
    const app = createApp({ db: memoryDb() });
    const reg = await request(app).post('/api/auth/register')
      .send({ name: 'Kea', surname: 'Mokoena', email: 'Kea@Example.com', password: 'hunter2hunter2' });
    expect(reg.status).toBe(201);
    expect(reg.body).toMatchObject({ email: 'kea@example.com', name: 'Kea', surname: 'Mokoena' });
    expect(reg.body).not.toHaveProperty('passwordHash');

    const login = await request(app).post('/api/auth/login')
      .send({ email: 'kea@example.com', password: 'hunter2hunter2' });
    expect(login.status).toBe(200);
    expect(login.body.id).toBe(reg.body.id);
  });

  it('rejects a wrong password and an unknown email the same way', async () => {
    const app = createApp({ db: memoryDb() });
    await request(app).post('/api/auth/register').send({ ...person, email: 'a@b.co', password: 'correct-horse' });
    const wrong = await request(app).post('/api/auth/login').send({ email: 'a@b.co', password: 'nope-nope' });
    const unknown = await request(app).post('/api/auth/login').send({ email: 'x@y.co', password: 'whatever1' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body).toEqual(unknown.body);
  });

  it('refuses duplicate emails and weak input', async () => {
    const app = createApp({ db: memoryDb() });
    await request(app).post('/api/auth/register').send({ ...person, email: 'a@b.co', password: 'correct-horse' });
    const dup = await request(app).post('/api/auth/register').send({ ...person, email: 'A@b.co', password: 'another-one' });
    expect(dup.status).toBe(409);
    expect((await request(app).post('/api/auth/register').send({ ...person, email: 'bad', password: 'longenough' })).status).toBe(400);
    expect((await request(app).post('/api/auth/register').send({ ...person, email: 'c@d.co', password: 'short' })).status).toBe(400);
  });

  it('requires a name and surname', async () => {
    const app = createApp({ db: memoryDb() });
    const noName = await request(app).post('/api/auth/register').send({ surname: 'Doe', email: 'a@b.co', password: 'longenough' });
    const noSurname = await request(app).post('/api/auth/register').send({ name: 'Jo', surname: '   ', email: 'a@b.co', password: 'longenough' });
    expect(noName.status).toBe(400);
    expect(noSurname.status).toBe(400);
    expect(noSurname.body.error).toMatch(/surname/i);
  });

  it('never stores the plain password', async () => {
    const db = memoryDb();
    await request(createApp({ db })).post('/api/auth/register').send({ ...person, email: 'a@b.co', password: 'correct-horse' });
    const { data } = db.student.create.mock.calls[0][0];
    expect(data.passwordHash).toMatch(/^scrypt\$/);
    expect(data.passwordHash).not.toContain('correct-horse');
  });
});
