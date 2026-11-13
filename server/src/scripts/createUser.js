// Creates (or resets the password of) a login account.
// Usage: node src/scripts/createUser.js <email> <password> [name]
import 'dotenv/config';
import { prisma } from '../db.js';
import { hashPassword } from '../routes/auth.js';

const [email, password, name] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: node src/scripts/createUser.js <email> <password> [name]');
  process.exit(1);
}

try {
  const normalised = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const student = await prisma.student.upsert({
    where: { email: normalised },
    update: { passwordHash, ...(name ? { name } : {}) },
    create: { email: normalised, passwordHash, name: name ?? null },
  });
  console.log(`Saved user ${student.email} (id ${student.id})`);
} finally {
  await prisma.$disconnect();
}
