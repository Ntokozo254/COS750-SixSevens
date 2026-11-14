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
