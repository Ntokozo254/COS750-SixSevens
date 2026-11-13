// Email + password accounts.
// Passwords are hashed with Node's built-in scrypt (random salt per user),
// so no plain-text password is ever stored.
import { Router } from 'express';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt}$${hash.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, salt, hashHex] = (stored ?? '').split('$');
  if (scheme !== 'scrypt' || !salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(password, salt, expected.length);
  return timingSafeEqual(expected, actual);
}

// Never send the password hash back to the browser.
const publicStudent = ({ id, email, name, studentNumber }) => ({ id, email, name, studentNumber });

function readCredentials(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  return { email, password };
}

export default function authRouter(db) {
  const router = Router();

  // POST /api/auth/register  { email, password, name? }
  router.post('/register', async (req, res, next) => {
    try {
      const { email, password } = readCredentials(req.body);
      const name = typeof req.body?.name === 'string' && req.body.name.trim() ? req.body.name.trim() : null;
      if (!EMAIL.test(email)) return res.status(400).json({ error: 'Enter a valid email address' });
      if (password.length < MIN_PASSWORD) {
        return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD} characters` });
      }
      if (await db.student.findUnique({ where: { email } })) {
        return res.status(409).json({ error: 'An account with that email already exists' });
      }
      const student = await db.student.create({
        data: { email, name, passwordHash: await hashPassword(password) },
      });
      res.status(201).json(publicStudent(student));
    } catch (e) {
      if (e?.code === 'P2002') return res.status(409).json({ error: 'An account with that email already exists' });
      next(e);
    }
  });

  // POST /api/auth/login  { email, password }
  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = readCredentials(req.body);
      const student = email ? await db.student.findUnique({ where: { email } }) : null;
      // Same message for "no such user" and "wrong password", so the form
      // doesn't reveal which emails have accounts.
      if (!student || !(await verifyPassword(password, student.passwordHash))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      res.json(publicStudent(student));
    } catch (e) {
      next(e);
    }
  });

  return router;
}
