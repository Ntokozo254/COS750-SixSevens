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