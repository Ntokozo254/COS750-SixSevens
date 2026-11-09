import 'dotenv/config';
import { createApp } from './app.js';
import { prisma } from './db.js';

const port = Number(process.env.PORT) || 3000;
const app = createApp({ db: prisma, corsOrigin: process.env.CORS_ORIGIN || '*' });

app.listen(port, () => {
  console.log(`COS212 API running on http://localhost:${port}`);
});